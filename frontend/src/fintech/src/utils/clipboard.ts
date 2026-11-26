const clipboard = {
  execCommandCopy(text: string) {
    return new Promise((resolve, reject) => {
      const copyEvent = (e: ClipboardEvent) => {
        e.clipboardData?.setData('text/plain', text);
        e.preventDefault();
      };

      document.addEventListener('copy', copyEvent);

      try {
        if (document.execCommand('copy')) {
          resolve(true);
        } else {
          reject();
        }
      } catch (err) {
        reject();
      } finally {
        document.removeEventListener('copy', copyEvent);
      }
    });
  },
  copy(text: string) {
    return this.execCommandCopy(text);
  },
  read() {
    if (navigator.clipboard) {
      return navigator.clipboard.readText();
    } else {
      throw new TypeError('Clipboard API is not supported in this browser.');
    }
  },
};

export default clipboard;
