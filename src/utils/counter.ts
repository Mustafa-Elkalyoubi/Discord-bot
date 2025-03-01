function counter() {
  return {
    inc(n = 1) {
      this.count += n;
    },
    dec(n = 1) {
      this.count -= n;
    },
    count: 0,
  };
}

export default counter;
