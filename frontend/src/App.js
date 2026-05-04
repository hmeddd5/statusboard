import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3001");

function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    socket.on("members:update", (data) => setMembers(data));
    socket.on("history:update", (data) => setHistory(data));

    return () => {
      socket.off("members:update");
      socket.off("history:update");
    };
  }, []);

  const handleJoin = () => {
    if (name.trim() === "") {
      alert("Veuillez entrer votre nom");
      return;
    }

    socket.emit("user:join", { name });
    setJoined(true);
  };

  const changeStatus = (status) => {
    socket.emit("status:change", { status });
  };

  const getColorClass = (status) => {
    if (status === "En ligne") return "online";
    if (status === "Absent") return "away";
    if (status === "Occupé") return "busy";
    return "";
  };

  const countStatus = (status) => {
    return members.filter((m) => m.status === status).length;
  };

  const getInitials = (memberName) => {
    return memberName.substring(0, 2).toUpperCase();
  };

  return (
      <div className="app">
        <header className="top-bar">
          <div className="logo">S</div>
          <h2>StatusBoard</h2>
          <span className="badge">{members.length} en ligne</span>

          {joined && (
              <div className="connected">
                Connecté : <strong>{name}</strong>
              </div>
          )}
        </header>

        {!joined && (
            <div className="overlay">
              <div className="login-card">
                <div className="login-logo">S</div>
                <h2>StatusBoard</h2>
                <p>Entrez votre nom pour rejoindre</p>

                <input
                    type="text"
                    placeholder="Votre nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <button onClick={handleJoin}>Rejoindre →</button>
              </div>
            </div>
        )}

        <main className="main">
          <aside className="sidebar">
            <h3>STATUTS</h3>

            <div className="status-row">
              <span className="dot online"></span>
              En ligne
              <strong>{countStatus("En ligne")}</strong>
            </div>

            <div className="status-row">
              <span className="dot away"></span>
              Absent
              <strong>{countStatus("Absent")}</strong>
            </div>

            <div className="status-row">
              <span className="dot busy"></span>
              Occupé
              <strong>{countStatus("Occupé")}</strong>
            </div>
          </aside>

          <section className="content">
            <div className="content-header">
              <h3>Membres connectés</h3>

              <div>
                <button className="view-btn">Grille</button>
                <button className="view-btn">Liste</button>
              </div>
            </div>

            <div className="members-grid">
              {members.map((member) => (
                  <div
                      key={member.id}
                      className={
                        member.id === socket.id ? "member-card current" : "member-card"
                      }
                  >
                    <div className="member-top">
                      <div className="avatar">{getInitials(member.name)}</div>

                      <div>
                        <h4>{member.name}</h4>
                        <p>{member.id === socket.id ? "Vous" : "Membre"}</p>
                      </div>

                      {member.id === socket.id && <span className="you">VOUS</span>}
                    </div>

                    <span className={`status-badge ${getColorClass(member.status)}`}>
                  ● {member.status}
                </span>

                    {member.id === socket.id && (
                        <div className="buttons">
                          <button onClick={() => changeStatus("En ligne")}>
                            En ligne
                          </button>
                          <button onClick={() => changeStatus("Absent")}>
                            Absent
                          </button>
                          <button onClick={() => changeStatus("Occupé")}>
                            Occupé
                          </button>
                        </div>
                    )}
                  </div>
              ))}
            </div>

            <h3 className="history-title">Historique des événements</h3>

            <div className="history">
              {history.map((event, index) => (
                  <p key={index}>• {event}</p>
              ))}
            </div>
          </section>
        </main>

        <footer>
          <p>Total {members.length}</p>
          <p>
            <span className="dot online"></span> Socket.io connecté — ws://localhost:3001
          </p>
        </footer>
      </div>
  );
}

export default App;