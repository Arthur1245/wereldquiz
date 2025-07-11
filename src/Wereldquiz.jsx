import React, { useState } from "react";
import { countries } from "./data/countries";
import LocatieKaart from "./LocatieKaart";
import "./Wereldquiz.css"; // <– CSS-bestand toegevoegd

const continents = ["Afrika", "Azië", "Europa", "Noord-Amerika", "Zuid-Amerika", "Oceanië"];
const quizTypes = ["Hoofdsteden", "Locaties", "Vlaggen"];

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export default function WereldQuizApp() {
  const [step, setStep] = useState("start");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedContinents, setSelectedContinents] = useState([]);
  const [results, setResults] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const toggleContinent = (continent) => {
    setSelectedContinents((prev) =>
      prev.includes(continent)
        ? prev.filter((c) => c !== continent)
        : [...prev, continent]
    );
  };

  const startQuiz = () => {
    if (selectedType && selectedContinents.length > 0) {
      const filteredCountries = countries.filter((c) =>
        selectedContinents.includes(c.continent)
      );
      const shuffled = [...filteredCountries].sort(() => Math.random() - 0.5);
      const initialQuestions = shuffled.map((country) => ({
        country,
        asked: false,
        retries: 0,
        correct: false,
      }));
      setQuestions(initialQuestions);
      setCurrentIndex(0);
      setStep("quiz");
      setResults(null);
      setFeedback("");
    }
  };

  const stopQuiz = () => {
    const juist = questions.filter((q) => q.correct).length;
    const fout = questions.length - juist;
    setResults({ juist, fout });
    setStep("resultaten");
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswer = () => {
    const correctAnswer =
      selectedType === "Hoofdsteden"
        ? currentQuestion.country.capital
        : selectedType === "Vlaggen"
        ? currentQuestion.country.name
        : "";

    if (normalize(answer) === normalize(correctAnswer)) {
      currentQuestion.correct = true;
      
      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
          const juist = questions.filter((q) => q.correct).length;
          const fout = questions.length - juist;
          setResults({ juist, fout });
          setStep("resultaten");
        } else {
          setCurrentIndex(nextIndex);
          setAnswer("");
          setFeedback("");
        }
      }, 0);
    } else {
      if (currentQuestion.retries === 0) {
        currentQuestion.retries++;
        questions.push(currentQuestion);
      }
      setFeedback(`❌ Fout! Het juiste antwoord is: ${correctAnswer}`);
    }
  };

  return (
    <main className="quiz-container">
      {step === "start" && (
        <div>
          <h1>Wereldquiz</h1>
          <p>Kies wat je wilt oefenen:</p>
          <div className="button-row">
            {quizTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`button ${selectedType === type ? "active" : ""}`}
              >
                {type}
              </button>
            ))}
          </div>

          <p>Kies continenten:</p>
          <div className="continent-grid">
            {continents.map((continent) => (
              <label key={continent}>
                <input
                  type="checkbox"
                  checked={selectedContinents.includes(continent)}
                  onChange={() => toggleContinent(continent)}
                />{" "}
                {continent}
              </label>
            ))}
          </div>

          <button
            onClick={startQuiz}
            disabled={!selectedType || selectedContinents.length === 0}
            className="button primary"
          >
            Start quiz
          </button>
        </div>
      )}

      {step === "quiz" && currentQuestion && (
  <div className="quiz-container">
    <button className="stop-button" onClick={() => setStep("start")}>
  Stop quiz
</button>


          <h2>Vraag {currentIndex + 1} van {questions.length}</h2>

          {selectedType === "Hoofdsteden" && (
            <p>Wat is de hoofdstad van <strong>{currentQuestion.country.name}</strong>?</p>
          )}

          {selectedType === "Vlaggen" && (
            <div>
              <img src={currentQuestion.country.flag} alt="Vlag" className="flag-image" />
              <p>Welk land hoort bij deze vlag?</p>
            </div>
          )}

          {selectedType === "Locaties" && (
            <div>
              <p>Klik op: <strong>{currentQuestion.country.name}</strong></p>
              <div className="kaart-container">
                <LocatieKaart
                  key={currentIndex}
                  correctCountry={questions[currentIndex].country}
                  onLandClick={(clickedEnglishName) => {
                    const clickedNorm = normalize(clickedEnglishName);
                    const matched = countries.find(
                      (c) => normalize(c.englishName) === clickedNorm
                    );

                    if (!matched) {
                      console.warn("Geen match gevonden voor:", clickedEnglishName);
                      return;
                    }

                    const correctNorm = normalize(questions[currentIndex].country.name);
                    const clickedNLNorm = normalize(matched.name);

                    const isCorrect = clickedNLNorm === correctNorm;

                    if (isCorrect) {
                      questions[currentIndex].correct = true;
                      setFeedback("✅ Juist!");
                      setTimeout(() => {
                        const nextIndex = currentIndex + 1;
                        if (nextIndex >= questions.length) {
                          const juist = questions.filter((q) => q.correct).length;
                          const fout = questions.length - juist;
                          setResults({ juist, fout });
                          setStep("resultaten");
                        } else {
                          setCurrentIndex(nextIndex);
                          setAnswer("");
                          setFeedback("");
                        }
                      }, 0);
                    } else {
                      if (questions[currentIndex].retries === 0) {
                        questions[currentIndex].retries++;
                        questions.push(questions[currentIndex]);
                      }
                      setFeedback(
                        `❌ Fout! Jij koos ${matched.name}, juist was ${questions[currentIndex].country.name}`
                      );
                    }
                  }}
                />
              </div>
              
            </div>
          )}

          {selectedType !== "Locaties" && (
            <form
  onSubmit={(e) => {
    e.preventDefault();
    handleAnswer();
  }}
  className="antwoord-form"
>
  <input
    type="text"
    value={answer}
    onChange={(e) => setAnswer(e.target.value)}
    placeholder="Typ je antwoord..."
    className="input"
  />
  <div className="bevestig-container">
    <button type="submit" className="button primary">Bevestig</button>
  </div>
</form>

          )}

          {feedback && <p className="feedback">{feedback}</p>}
        </div>
      )}

      {step === "resultaten" && results && (
        <div>
          <h2>Resultaten</h2>
          <p>Juist: {results.juist}</p>
          <p>Fout: {results.fout}</p>
          <button className="button primary" onClick={() => setStep("start")}>Opnieuw</button>
        </div>
      )}
    </main>
  );
}
