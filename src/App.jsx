import { useCallback, useEffect, useRef, useState } from "react";

const letterText = [
  "Desde que llegaste, todo se siente más bonito.",
  "Me haces sonreír incluso en los días difíciles, y contigo todo vale más la pena.",
  "Hoy quiero preguntarte algo que me hace mucha ilusión:",
  "",
  "¿Quieres ser mi San Valentín?",
].join("\n");

const HEART_COUNT = 65;
const HEART_LIFETIME_MS = 5200;
const TYPING_MS = 70;
const DODGE_COOLDOWN_MS = 140;
const MOBILE_ROAM_INTERVAL_MS = 620;
const CATCH_ME_TEXT_MS = 1400;

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [noMoves, setNoMoves] = useState(0);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [noCatchText, setNoCatchText] = useState("");
  const [noButtonStyle, setNoButtonStyle] = useState({});
  const noButtonRef = useRef(null);
  const typedOnce = useRef(false);
  const timersRef = useRef([]);
  const typingTimerRef = useRef(null);
  const lastDodgeAtRef = useRef(0);
  const mobileRoamTimerRef = useRef(null);
  const rotateRef = useRef(0);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
      if (mobileRoamTimerRef.current) {
        clearInterval(mobileRoamTimerRef.current);
      }
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const updatePointerType = () => {
      setIsCoarsePointer(query.matches);
    };

    updatePointerType();
    query.addEventListener("change", updatePointerType);
    return () => {
      query.removeEventListener("change", updatePointerType);
    };
  }, []);

  const startTyping = () => {
    if (typedOnce.current) return;
    typedOnce.current = true;
    setTypedText("");
    setIsTypingDone(false);

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    let i = 0;
    typingTimerRef.current = setInterval(() => {
      i += 1;
      setTypedText(letterText.slice(0, i));

      if (i >= letterText.length) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setIsTypingDone(true);
      }
    }, TYPING_MS);
  };

  const celebrate = () => {
    setShowResult(true);

    const nextHearts = Array.from({ length: HEART_COUNT }, (_, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      emoji: Math.random() > 0.3 ? "💖" : "💗",
      left: `${Math.random() * 100}vw`,
      animationDuration: `${2 + Math.random() * 2.8}s`,
      fontSize: `${0.8 + Math.random() * 1.3}rem`,
      opacity: String(0.5 + Math.random() * 0.5),
    }));

    setHearts((prev) => [...prev, ...nextHearts]);

    nextHearts.forEach((heart) => {
      const timer = setTimeout(() => {
        setHearts((prev) => prev.filter((item) => item.id !== heart.id));
      }, HEART_LIFETIME_MS);
      timersRef.current.push(timer);
    });
  };

  const getPointFromEvent = (event) => {
    if (!event) return null;
    if ("touches" in event && event.touches?.[0]) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    if ("changedTouches" in event && event.changedTouches?.[0]) {
      return {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY,
      };
    }
    if ("clientX" in event && "clientY" in event) {
      return { x: event.clientX, y: event.clientY };
    }
    return null;
  };

  const moveNoButtonAway = useCallback((point, angle) => {
    const button = noButtonRef.current;
    if (!button) return;

    const maxX = window.innerWidth - button.offsetWidth - 20;
    const maxY = window.innerHeight - button.offsetHeight - 20;

    let bestX = Math.max(10, Math.random() * maxX);
    let bestY = Math.max(10, Math.random() * maxY);
    let bestDistance = -1;

    for (let i = 0; i < 18; i += 1) {
      const candidateX = Math.max(10, Math.random() * maxX);
      const candidateY = Math.max(10, Math.random() * maxY);
      if (!point) {
        bestX = candidateX;
        bestY = candidateY;
        break;
      }
      const distance = Math.hypot(point.x - candidateX, point.y - candidateY);
      if (distance > bestDistance) {
        bestDistance = distance;
        bestX = candidateX;
        bestY = candidateY;
      }
    }

    const nextStyle = {
      position: "fixed",
      left: `${bestX}px`,
      top: `${bestY}px`,
      zIndex: 30,
      width: "max-content",
    };
    if (typeof angle === "number") {
      nextStyle.transform = `rotate(${angle}deg)`;
    }

    setNoButtonStyle(nextStyle);
  }, []);

  const dodgeNoButton = useCallback(
    (event) => {
      if (event?.preventDefault) event.preventDefault();
      const now = Date.now();
      if (now - lastDodgeAtRef.current < DODGE_COOLDOWN_MS) return;
      lastDodgeAtRef.current = now;
      moveNoButtonAway(getPointFromEvent(event));
      setNoMoves((prev) => prev + 1);
    },
    [moveNoButtonAway],
  );

  const showCatchMeText = useCallback(() => {
    setNoCatchText("Atrápame si puedes 😜");
    const timer = setTimeout(() => {
      setNoCatchText("");
    }, CATCH_ME_TEXT_MS);
    timersRef.current.push(timer);
  }, []);

  const handleNoTouchStart = useCallback(
    (event) => {
      if (!isCoarsePointer) return;
      if (event?.preventDefault) event.preventDefault();

      if (!isTypingDone) {
        dodgeNoButton(event);
        return;
      }

      showCatchMeText();
      rotateRef.current = (rotateRef.current + 120) % 360;
      moveNoButtonAway(getPointFromEvent(event), rotateRef.current);
      setNoMoves((prev) => prev + 1);
    },
    [dodgeNoButton, isCoarsePointer, isTypingDone, moveNoButtonAway, showCatchMeText],
  );

  const handleNoPointerDown = useCallback(
    (event) => {
      if (event.pointerType === "touch") return;
      dodgeNoButton(event);
    },
    [dodgeNoButton],
  );

  const handleNoClick = useCallback(
    (event) => {
      event.preventDefault();
      if (isCoarsePointer && isTypingDone) {
        showCatchMeText();
      }
    },
    [isCoarsePointer, isTypingDone, showCatchMeText],
  );

  useEffect(() => {
    if (!isOpen || !isTypingDone || !isCoarsePointer || showResult) return;

    const roam = () => {
      rotateRef.current = (rotateRef.current + 135) % 360;
      moveNoButtonAway(null, rotateRef.current);
    };

    roam();
    mobileRoamTimerRef.current = setInterval(roam, MOBILE_ROAM_INTERVAL_MS);
    return () => {
      if (mobileRoamTimerRef.current) {
        clearInterval(mobileRoamTimerRef.current);
        mobileRoamTimerRef.current = null;
      }
    };
  }, [isOpen, isTypingDone, isCoarsePointer, showResult, moveNoButtonAway]);

  const noButtonLabel =
    !isCoarsePointer && noMoves > 2 ? "Ni lo intentes 😅" : "No 🙈";

  return (
    <>
      <div className={`overlay ${isOpen ? "hidden" : ""}`}>
        <section className="cover-card">
          <h1>Tengo algo importante que decirte...</h1>
          <p>
            Preparé esta carta para ti con mucho cariño.
            <br />
            Ábrela cuando estés lista.
          </p>
          <button
            className="cta"
            onClick={() => {
              setIsOpen(true);
              startTyping();
            }}
          >
            Abrir carta 💌
          </button>
        </section>
      </div>

      <main className="main">
        <section className="letter">
          <span className="tag">Para Yami, con todo mi amor</span>
          <h2>Mi carta para ti</h2>
          <p id="typedText">{typedText}</p>

          {isTypingDone && (
            <>
              <div className="buttons">
                <button className="cta" onClick={celebrate}>
                  Sí 💖
                </button>
                {!showResult && (
                  <button
                    ref={noButtonRef}
                    className="alt no-button"
                    style={noButtonStyle}
                    onMouseEnter={!isCoarsePointer ? dodgeNoButton : undefined}
                    onFocus={dodgeNoButton}
                    onPointerDown={handleNoPointerDown}
                    onTouchStart={handleNoTouchStart}
                    onClick={handleNoClick}
                  >
                    {noButtonLabel}
                  </button>
                )}
              </div>
              {!showResult && (
                <p className={`no-catch-text ${noCatchText ? "show" : ""}`} aria-live="polite">
                  {noCatchText}
                </p>
              )}
            </>
          )}

          <p className={`result ${showResult ? "show" : ""}`}>
            Ahora oficialmente eres mi San Valentín. Te amo.
          </p>
        </section>
      </main>

      <div className="heart-rain">
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className="heart"
            style={{
              left: heart.left,
              animationDuration: heart.animationDuration,
              fontSize: heart.fontSize,
              opacity: heart.opacity,
            }}
          >
            {heart.emoji}
          </span>
        ))}
      </div>
    </>
  );
}

export default App;
