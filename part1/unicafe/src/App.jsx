import React, { useState } from "react";

const StatisticLine = ({ text, value }) => {
  return (
    <tr>
      <td>{text}</td>
      <td>
        {value} {text === "positive" && "%"}
      </td>
    </tr>
  );
};

const Statistics = ({ good, neutral, bad, all, average, positive }) => {
  return (
    <table>
      <tbody>
        <StatisticLine text="good" value={good} />
        <StatisticLine text="neutral" value={neutral} />
        <StatisticLine text="bad" value={bad} />
        <StatisticLine text="all" value={all} />
        <StatisticLine text="average" value={average} />
        <StatisticLine text="positive" value={positive} />
      </tbody>
    </table>
  );
};

const Button = ({ value, onClick, text = value }) => {
  return (
    <button value={value} onClick={onClick}>
      {text}
    </button>
  );
};

const App = () => {
  const [good, setGood] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [bad, setBad] = useState(0);
  const [feedback, setFeedback] = useState(false);

  const handleClick = (event) => {
    switch (event.target.value) {
      case "good":
        setGood((prev) => prev + 1);
        break;
      case "neutral":
        setNeutral((prev) => prev + 1);
        break;
      case "bad":
        setBad((prev) => prev + 1);
        break;
    }
    if (!feedback) setFeedback(true);
  };

  const all = () => good + neutral + bad;

  const average = () => {
    const total = all();
    return total === 0 ? 0 : (good - bad) / total;
  };

  const positive = () => {
    const total = all();
    return total === 0 ? 0 : (good * 100) / total;
  };

  return (
    <div>
      <h1>give feedback</h1>
      <Button value="good" onClick={handleClick} />
      <Button value="neutral" onClick={handleClick} />
      <Button value="bad" onClick={handleClick} />
      <h1>statistics</h1>
      {!feedback ? (
        <p>No feedback given</p>
      ) : (
        <Statistics
          good={good}
          neutral={neutral}
          bad={bad}
          all={all()}
          average={average()}
          positive={positive()}
        />
      )}
    </div>
  );
};

export default App;
