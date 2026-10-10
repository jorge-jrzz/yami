import { useEffect, useRef, useState } from "react";
import { balloons } from "balloons-js";
import { carta } from "./carta.js";

const REVEAL_DELAY_MS = 1200;
const LETTER_PHOTO_POSITIONS = ["left", "right", "center"];
const LETTER_HEARTS = Array.from({ length: 22 }, (_, index) => ({
  left: `${(index * 47 + 13) % 100}%`,
  delay: `${(index % 7) * 0.18}s`,
  duration: `${2.6 + (index % 4) * 0.4}s`,
  size: `${16 + (index % 4) * 6}px`,
  drift: `${(index % 2 ? 1 : -1) * (18 + (index % 5) * 8)}px`,
}));

function WallSwitch({ onLightOn }) {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className={`switch-scene${isOn ? " switch-scene--lit" : ""}`}>
      <div className="switch-intro">
        <h1>Yami, prende la luz</h1>
      </div>

      <label className="switch-wrap">
        <input
          aria-label="Encender la luz y revelar la sorpresa"
          className="light-switch"
          type="checkbox"
          checked={isOn}
          disabled={isOn}
          onChange={(event) => {
            setIsOn(event.target.checked);
            if (event.target.checked) onLightOn();
          }}
        />
        <div className="wall-panel" aria-hidden="true">
          <div className="switch__screw top">
            <div className="switch__screw-slot" />
          </div>
          <div className="switch__hole">
            <div className="switch__groove">
              <div className="switch__lever">
                <div className="switch__shadow-box top">
                  <div className="switch__shadow top" />
                </div>
                <div className="switch__shadow-box bottom">
                  <div className="switch__shadow bottom" />
                </div>
                <div className="switch__top">
                  <div className="switch__top-outset" />
                </div>
                <div className="switch__bottom">
                  <div className="switch__bottom-outset" />
                </div>
              </div>
            </div>
          </div>
          <div className="switch__screw bottom">
            <div className="switch__screw-slot" />
          </div>
        </div>
      </label>

      <div className="light-overlay" />
    </div>
  );
}

function AudioControls({ isPaused, isMuted, onTogglePause, onToggleMute }) {
  return (
    <div className="audio-controls" role="group" aria-label="Controles de la canción">
      <button
        className="audio-control-button"
        type="button"
        aria-label={isPaused ? "Reanudar canción" : "Pausar canción"}
        title={isPaused ? "Reanudar canción" : "Pausar canción"}
        aria-pressed={isPaused}
        onClick={onTogglePause}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          {isPaused ? (
            <path d="M8 5.5v13L19 12 8 5.5Z" />
          ) : (
            <path d="M8 5v14M16 5v14" />
          )}
        </svg>
      </button>
      <button
        className="audio-control-button"
        type="button"
        aria-label={isMuted ? "Activar sonido" : "Silenciar canción"}
        title={isMuted ? "Activar sonido" : "Silenciar canción"}
        aria-pressed={isMuted}
        onClick={onToggleMute}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
          {isMuted ? (
            <path d="m17 9 5 6m0-6-5 6" />
          ) : (
            <path d="M16 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12" />
          )}
        </svg>
      </button>
    </div>
  );
}

function BirthdayGreeting({
  isSongPaused,
  isSongMuted,
  onTogglePause,
  onToggleMute,
}) {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const closeButton = useRef(null);
  const sealButton = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      balloons();
      document.querySelector("balloons")?.style.setProperty("z-index", "1", "important");
    }, 180);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLetterOpen) return;

    const shell = document.querySelector(".app-shell");
    const previousOverflow = shell.style.overflowY;
    shell.style.overflowY = "hidden";
    closeButton.current?.focus();

    const onEscape = (event) => {
      if (event.key === "Escape") setIsLetterOpen(false);
    };

    window.addEventListener("keydown", onEscape);
    return () => {
      shell.style.overflowY = previousOverflow;
      window.removeEventListener("keydown", onEscape);
      sealButton.current?.focus();
    };
  }, [isLetterOpen]);

  const openLetter = () => {
    setIsLetterOpen(true);
  };

  return (
    <main className="birthday-scene">
      <AudioControls
        isPaused={isSongPaused}
        isMuted={isSongMuted}
        onTogglePause={onTogglePause}
        onToggleMute={onToggleMute}
      />

      <div className="birthday-card">
        <img
          className="birthday-photo"
          src="./images/yamita.webp"
          alt="Yamita celebrando su cumpleaños"
          width="768"
          height="1024"
          loading="eager"
          fetchPriority="high"
        />
        <h1>¡Felices 23, Yami!</h1>
        <div className="birthday-cake" role="img" aria-label="Pastel de cumpleaños">
          🎂
        </div>
      </div>

      <section className="letter-section" aria-label="Carta de cumpleaños">
        <div className="letter-container">
          <div className="envelope-back" aria-hidden="true">
            <svg viewBox="0 0 375 220" preserveAspectRatio="none">
              <rect className="envelope-back-base" width="375" height="220" />
            </svg>
          </div>

          <div className="envelope-front">
            <div className="seal-container">
              <button
                ref={sealButton}
                className="envelope-seal"
                type="button"
                aria-label="Abrir carta para Yami"
                aria-expanded={isLetterOpen}
                aria-controls="heartfelt-letter"
                onClick={openLetter}
              >
                ♥
              </button>
            </div>
            <svg viewBox="0 0 375 220" preserveAspectRatio="none" aria-hidden="true">
              <polygon
                className="envelope-front-base"
                points="0,0 187,154 375,0 375,220 0,220 0,0"
              />
              <polygon className="envelope-flap-closed" points="0,0 375,0 187,154 0,0" />
            </svg>
          </div>
        </div>
      </section>

      {isLetterOpen && (
        <div className="letter-modal" role="presentation">
          <div className="letter-hearts" aria-hidden="true">
            {LETTER_HEARTS.map((heart, index) => (
              <span
                className="letter-heart"
                key={index}
                style={{
                  left: heart.left,
                  animationDelay: heart.delay,
                  animationDuration: heart.duration,
                  fontSize: heart.size,
                  "--drift": heart.drift,
                }}
              >
                ♥
              </span>
            ))}
          </div>
          <article
            className="letter-page"
            id="heartfelt-letter"
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-title"
          >
            <button
              ref={closeButton}
              className="letter-close"
              type="button"
              aria-label="Cerrar carta"
              onClick={() => setIsLetterOpen(false)}
            >
              ×
            </button>
            <div className="letter-page-copy">
              <h2 id="letter-title">{carta.titulo}</h2>
              <p className="letter-message">{carta.parrafos[0]}</p>
              {LETTER_PHOTO_POSITIONS.map((position, index) => (
                <div className="letter-chapter" key={position}>
                  <figure className={`letter-photo letter-photo--${position}`}>
                    <div
                      className="letter-photo-placeholder"
                      role="img"
                      aria-label={`Foto ${index + 1}`}
                    >
                      {index + 1}
                    </div>
                  </figure>
                  <p className="letter-message">{carta.parrafos[index + 1]}</p>
                </div>
              ))}
              <p className="letter-signature">{carta.firma}</p>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

function App() {
  const [showBirthday, setShowBirthday] = useState(false);
  const [isSongPaused, setIsSongPaused] = useState(false);
  const [isSongMuted, setIsSongMuted] = useState(false);
  const revealTimer = useRef(null);
  const birthdaySong = useRef(null);

  useEffect(() => {
    const image = new Image();
    image.src = "./images/yamita.webp";
    image.decode().catch(() => {});

    return () => {
      if (revealTimer.current) window.clearTimeout(revealTimer.current);
      birthdaySong.current?.pause();
    };
  }, []);

  const revealBirthday = () => {
    const song = new Audio("./audio/cepillin.mp3");
    song.preload = "auto";
    birthdaySong.current = song;
    song.addEventListener("ended", () => setIsSongPaused(true), { once: true });
    song.play().then(
      () => setIsSongPaused(false),
      (error) => {
        setIsSongPaused(true);
        console.error("No se pudo iniciar la canción de cumpleaños:", error);
      },
    );

    revealTimer.current = window.setTimeout(
      () => setShowBirthday(true),
      REVEAL_DELAY_MS,
    );
  };

  const toggleSongPlayback = () => {
    const song = birthdaySong.current;
    if (!song) return;

    if (song.paused) {
      if (song.ended) song.currentTime = 0;
      song.play().then(
        () => setIsSongPaused(false),
        (error) => console.error("No se pudo reanudar la canción:", error),
      );
    } else {
      song.pause();
      setIsSongPaused(true);
    }
  };

  const toggleSongMute = () => {
    const song = birthdaySong.current;
    if (!song) return;

    song.muted = !song.muted;
    setIsSongMuted(song.muted);
  };

  return (
    <div className={`app-shell${showBirthday ? " app-shell--revealed" : ""}`}>
      <div className="switch-stage" aria-hidden={showBirthday}>
        <WallSwitch onLightOn={revealBirthday} />
      </div>
      <div className="birthday-stage" aria-hidden={!showBirthday}>
        {showBirthday && (
          <BirthdayGreeting
            isSongPaused={isSongPaused}
            isSongMuted={isSongMuted}
            onTogglePause={toggleSongPlayback}
            onToggleMute={toggleSongMute}
          />
        )}
      </div>
    </div>
  );
}

export default App;
