uni.addInterceptor({
  returnValue (res) {
    if (!(!!res && (typeof res === "object" || typeof res === "function") && typeof res.then === "function")) {
      return res;
    }
    return new Promise((resolve, reject) => {
      res.then((res) => {
        if (Array.isArray(res) && res.length >= 2) {
          res[0] ? reject(res[0]) : resolve(res[1]);
        } else {
          resolve(res);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  },
});