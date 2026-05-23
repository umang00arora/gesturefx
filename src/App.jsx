import "./App.css";
import HandTracker from "./components/HandTracker";

function App() {

  return (
    <div className="app">

      <h1 className="title">
        Umang Gestures
      </h1>

      <p className="instructions">
  1️⃣ 😎 Glasses &nbsp; | &nbsp;
  2️⃣ 👑 Crown &nbsp; | &nbsp;
  3️⃣ 🥸 Mustache &nbsp; | &nbsp;
  4️⃣ 🤡 Clown &nbsp; | &nbsp;
  5️⃣ 👀 Anime Eyes
</p>

      <HandTracker />

    </div>
  );
}

export default App;