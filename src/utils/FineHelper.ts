import { Message } from "discord.js";
import { FineData } from "../types";

export const beautifyNumber = (number: number) => {
  return BigInt(number)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const calcAndSaveFine = (message: Message, fines: FineData) => {
  const authorID = message.author.id;

  if (!message.content.includes("🥹")) return 0;

  if (!fines.userFineData[authorID])
    fines.userFineData[authorID] = {
      username: message.author.username,
      fineAmount: 0,
      fineCap: 5000,
      capReached: false,
    };

  const { fineAmount: currentFine, fineCap: cap } = fines.userFineData[authorID];

  if (currentFine >= cap) {
    message.react(`855089585919098911`);
    return 0;
  }

  // in case user changed username
  fines.userFineData[authorID].username = message.author.username;

  // Percentage of max is 20% - 10%
  var percentageOfCap = ((0.2 - 0.1) / (5000 - 1000000000)) * (cap - 1000000000) + 0.1;
  if (percentageOfCap < 0.1) percentageOfCap = 0.1;
  // Random for cap between max % of cap and 3.5% of the cap
  const randomAmount = Math.floor(Math.random() * (cap * percentageOfCap) + cap * 0.035);
  const thisFine =
    randomAmount + currentFine >= cap
      ? cap - fines.userFineData[authorID].fineAmount
      : randomAmount;
  fines.userFineData[authorID].fineAmount += thisFine;

  if (fines.userFineData[authorID].fineAmount >= cap)
    fines.userFineData[authorID].capReached = true;

  return thisFine;
};
