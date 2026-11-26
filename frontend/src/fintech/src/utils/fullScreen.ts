export default {
  open(element: Element) {
    element.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
      );
    });
  },
  exit() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  },
};
