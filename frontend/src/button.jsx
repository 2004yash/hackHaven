export default function Button() {
    const openInNewTab = (url) => {
      window.open(url, "_blank", "noreferrer");
    };
    return (
      <div>
        <p>start/join call</p>{" "}
        <button
          role="link"
          onClick={() => openInNewTab("https://ypavanr.github.io/agorta/")}
        >
          Visit
        </button>
      </div>
    );
  }
  