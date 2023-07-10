import './App.css';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

function App() {


  const supabase = createClient('https://rhyflflbuwpqnmlrqzmm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeWZsZmxidXdwcW5tbHJxem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg5NTU0NjMsImV4cCI6MjAwNDUzMTQ2M30.L99XjZLSB3cRhw35CAZ07BpVmjLrPKMEqLF6Meqb5VY');

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchTableData = async () => {
      const { data, error } = await supabase
        .from('Leaderboard')
        .select('*')
        .order('Wins', { ascending: false }); // Order by Wins column in descending order
      if (error) {
        console.error('Error fetching table data:', error);
      } else {
        setTableData(data);
      }
    };
  
    fetchTableData();
  }, []);
  
  const generateMatches = () => {
    const matches = [];

    // Iterate over each person
    for (let i = 0; i < tableData.length; i++) {
      const person1 = tableData[i].Name;

      // Iterate over other persons
      for (let j = i + 1; j < tableData.length; j++) {
        const person2 = tableData[j].Name;
        const match = `${person1} vs ${person2}`;
        matches.push(match);
      }
    }
    return matches;
  };

  
    // State to track the selected winner for each match
    const [winners, setWinners] = useState({});
  
    // Handle winner selection for a match
    const handleWinnerSelect = (match, winner) => {
      setWinners(prevState => ({
        ...prevState,
        [match]: winner
      }));
    };
  
    const updateWins = async (person) => {
      try {
        const { data, error } = await supabase
          .from('Leaderboard')
          .update({ Wins: supabase.sql('Wins + 1') })
          .eq('Name', person);
  
        if (error) {
          console.error('Error updating wins:', error);
        } else {
          console.log(`Successfully updated wins for ${person}`);
        }
      } catch (error) {
        console.error('Error updating wins:', error);
      }
    };

    const handleSubmit = (match) => {
      const winner = winners[match];
      if (winner) {
        updateWins(winner);
      } else {
        console.error('No winner selected for match:', match);
      }
    };

  return (
    <div className="App">
      <h1>Pool Score Board</h1>
      <table className="centered-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Played</th>
            <th>Wins</th>
            <th>Losses</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{row.Name}</td>
              <td>{row.Wins + row.Losses}</td>
              <td>{row.Wins}</td>
              <td>{row.Losses}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>All Matches</h2>
      <div className="matches-container">
      <p>Who won?</p>
      <ul>
        {generateMatches().map((match, index) => (
          <li key={index}>
            <span>{match}</span>
            <select
                className="select-dropdown"
                value={winners[match] || ''}
                onChange={(e) => handleWinnerSelect(match, e.target.value)}
              >
                <option value="">Choose winner</option>
                <option value={match.split(' vs ')[0]}>
                  {match.split(' vs ')[0]}
                </option>
                <option value={match.split(' vs ')[1]}>
                  {match.split(' vs ')[1]}
                </option>
              </select>
            <button
              className="submit-button"
              disabled={!winners[match]}
              onClick={() => handleSubmit(match)}
            >
              Submit
            </button>
          </li>
        ))}
      </ul>
    </div>

    </div>
  );
  
}


export default App;
