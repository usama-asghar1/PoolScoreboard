import './App.css';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

function App() {


  const supabase = createClient('https://rhyflflbuwpqnmlrqzmm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeWZsZmxidXdwcW5tbHJxem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg5NTU0NjMsImV4cCI6MjAwNDUzMTQ2M30.L99XjZLSB3cRhw35CAZ07BpVmjLrPKMEqLF6Meqb5VY');

  const [tableData, setTableData] = useState([]);

    /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
     
    fetchTableData();
  }, []);

    /* eslint-disable react-hooks/exhaustive-deps */
    
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
  
  const generateMatches = () => {
    const matches = [];
  
    // Iterate over each person
    for (let i = 0; i < tableData.length; i++) {
      const person1 = tableData[i].Name;
  
      // Iterate over other persons
      for (let j = i + 1; j < tableData.length; j++) {
        const person2 = tableData[j].Name;
        const match = `${person1} vs ${person2}`;
  
        // Exclude the finished matches
        if (!finishedMatches.includes(match)) {
          matches.push(match);
        }
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
          .select('Wins')
          .eq('Name', person)
          .single();
  
        if (error) {
          console.error('Error fetching wins:', error);
          return;
        }
  
        const updatedWins = data.Wins + 1;
  
        const { error: updateError } = await supabase
          .from('Leaderboard')
          .update({ Wins: updatedWins })
          .eq('Name', person);
  
        if (updateError) {
          console.error('Error updating wins:', updateError);
        } else {
          console.log(`Successfully updated wins for ${person}`);
        }
      } catch (error) {
        console.error('Error updating wins:', error);
      }
    };

    const updateLosses = async (person) => {
      try {
        const { data, error } = await supabase
          .from('Leaderboard')
          .select('Losses')
          .eq('Name', person)
          .single();
    
        if (error) {
          console.error('Error fetching losses:', error);
          return;
        }
    
        const updatedLosses = data.Losses + 1;
    
        const { error: updateError } = await supabase
          .from('Leaderboard')
          .update({ Losses: updatedLosses })
          .eq('Name', person);
    
        if (updateError) {
          console.error('Error updating losses:', updateError);
        } else {
          console.log(`Successfully updated losses for ${person}`);
        }
      } catch (error) {
        console.error('Error updating losses:', error);
      }
    };

    const [finishedMatches, setFinishedMatches] = useState([]);
    const [matchHistory, setMatchHistory] = useState([]);
    

    const fetchMatchHistory = () => {
      return supabase
        .from('MatchHistory')
        .select('*')
        .order('id', { ascending: false }) // Order by id column in descending order
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching match history:', error);
            throw error;
          } else {
            setMatchHistory(data);
            return data; // Return the fetched data
          }
        })
        .catch((error) => {
          console.error('Error fetching match history:', error);
          throw error;
        });
    };
    
    useEffect(() => {
      fetchMatchHistory();
    }, []);
    
    
    
    
    

    const handleSubmit = async (match) => {
      const [person1, person2] = match.split(' vs ');
      const winner = winners[match];
    
      if (winner) {
        const loser = winner === person1 ? person2 : person1;
        
        await Promise.all([updateWins(winner), updateLosses(loser)]);
        await fetchTableData(); // Fetch the updated table data
       // Fetch the updated match history
    
       setFinishedMatches(prevState => [...prevState, match]);
       setWinners(prevState => ({ ...prevState, [match]: winner }));
     
       await fetchMatchHistory(); // Fetch the updated match history
        try {
          const { data, error } = await supabase
            .from('MatchHistory')
            .insert([{ match, winner }]);
            console.log(data);
      
          if (error) {
            console.error('Error storing match result:', error);
          } else {
            console.log('Match result stored successfully.');
          }
        } catch (error) {
          console.error('Error storing match result:', error);
        }
    
        setFinishedMatches(prevState => [...prevState, match]);
        setWinners(prevState => ({ ...prevState, [match]: winner }));
        await fetchMatchHistory();
      } else {
        console.error('No winner selected for match:', match);
      }
    };
    
    
    
    
    const handleAddPlayer = async () => {
      const playerName = prompt("Enter the name of the new player:");
    
      if (playerName) {
        try {
          const { data, error } = await supabase
            .from("Leaderboard")
            .insert([{ Name: playerName, Wins: 0, Losses: 0 }]);

            console.log(data);
    
          if (error) {
            console.error("Error adding player:", error);
          } else {
            console.log("Player added successfully.");
            fetchTableData(); // Fetch the updated table data
          }
        } catch (error) {
          console.error("Error adding player:", error);
        }
      }
    };

    const handleDeletePlayer = async (player) => {
      try {
        const { error } = await supabase
          .from('Leaderboard')
          .delete()
          .eq('Name', player.Name);
    
        if (error) {
          console.error('Error deleting player:', error);
        } else {
          console.log(`Player ${player.Name} deleted successfully.`);
          fetchTableData(); // Fetch the updated table data
        }
      } catch (error) {
        console.error('Error deleting player:', error);
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
    <td>
      <button className="delete-button" onClick={() => handleDeletePlayer(row)}>
        Delete ❌
      </button>
    </td>
  </tr>
))}

        </tbody>
      </table>
      
    <button className="add-player-button" onClick={handleAddPlayer}>
      Add Player
    </button>

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

   
    <h2>Previous Matches</h2>
{matchHistory.length > 0 && (
  <ul>
    {matchHistory.map((match, index) => (
      <li key={index}>
        <span>{match.match}</span>
        <span> Winner: {match.winner}</span>
      </li>
    ))}
  </ul>
)}


    </div>
  );
  
}


export default App;
