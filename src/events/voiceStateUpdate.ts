import { Events, VoiceState } from "discord.js";
import ExtendedClient from "../utils/Client";
import { ensureRole } from "../utils/general";

export = {
  name: Events.VoiceStateUpdate,
  async run(oldState: VoiceState, newState: VoiceState) {
    const client = oldState.client as ExtendedClient;

    const roleName = `VC ${oldState.channel?.name || newState.channel?.name}`;

    // user joined vc
    if (oldState.channelId === null) {
      const role = await ensureRole(roleName, newState.guild.id, client);
      if (!role) throw "something went wrong";
      newState.member?.roles.add(role);
    }

    // user left vc
    if (newState.channelId === null) {
      const role = await ensureRole(roleName, oldState.guild.id, client);
      if (!role) return;
      newState.member?.roles.remove(role);

      const vcCount = oldState.channel!.members.size;
      if (vcCount < 1) oldState.guild.roles.delete(role, "Voice Channel role deleted");
    }
  },
};
