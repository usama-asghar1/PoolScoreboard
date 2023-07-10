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
  
        const match1 = `${person1} vs ${person2}`;
        const match2 = `${person2} vs ${person1}`;
  
        // Exclude the finished matches and duplicates
        if (
          !finishedMatches.includes(match1) &&
          !finishedMatches.includes(match2) &&
          !matches.includes(match1) &&
          !matches.includes(match2)
        ) {
          matches.push(match1);
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
    

    const fetchMatchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('FinishedMatches')
          .select('*');
    
        if (error) {
          console.error('Error fetching match history:', error);
        } else {
          const finishedMatches = data.map((match) => match.match);
          setFinishedMatches(finishedMatches);
          setMatchHistory(data);
        }
      } catch (error) {
        console.error('Error fetching match history:', error);
      }
    };
    
    
    useEffect(() => {
      fetchMatchHistory();
    }, []);
    
        
    const handleSubmit = async (match) => {
      const [person1, person2] = match.split(' vs ');
      const winner = winners[match];
    
      if (winner) {
        const loser = winner === person1 ? person2 : person1;
    
        // Update the wins and losses
        await Promise.all([updateWins(winner), updateLosses(loser)]);
        await fetchTableData(); // Fetch the updated table data
    
        // Store the match result in the FinishedMatches table
        try {
          const { data, error } = await supabase
            .from('FinishedMatches')
            .insert([{ match, winner }]);
            console.log(data);
    
          if (error) {
            console.error('Error storing match result:', error);
          } else {
            console.log('Match result stored in FinishedMatches table successfully.');
            setFinishedMatches(prevState => [...prevState, match]);
          }
        } catch (error) {
          console.error('Error storing match result:', error);
        }
    
        // Store the match result in the MatchHistory table
        try {
          const { data, error } = await supabase
            .from('MatchHistory')
            .insert([{ match, winner }]);
            console.log(data);
    
          if (error) {
            console.error('Error storing match result:', error);
          } else {
            console.log('Match result stored in MatchHistory table successfully.');
            await fetchMatchHistory(); // Fetch the updated match history
          }
        } catch (error) {
          console.error('Error storing match result:', error);
        }
    
        setWinners(prevState => ({ ...prevState, [match]: winner }));
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
  
    const handleDeleteAllMatches = async () => {
      try {
        const { data, error } = await supabase
          .from('FinishedMatches')
          .select('id');
    
        if (error) {
          console.error('Error fetching match data:', error);
          return;
        }
    
        const matchIds = data.map((match) => match.id);
    
        if (matchIds.length === 0) {
          console.log('No matches found.');
          return;
        }
    
        const { error: deleteError } = await supabase
          .from('FinishedMatches')
          .delete()
          .in('id', matchIds);
    
        if (deleteError) {
          console.error('Error deleting all matches:', deleteError);
        } else {
          setFinishedMatches([]); // Clear the finishedMatches state
          console.log('All matches deleted successfully.');
        }
      } catch (error) {
        console.error('Error deleting all matches:', error);
      }
    };
    
    
    const handleDeleteAllPreviousMatches = async () => {
      try {
        const { data, error } = await supabase
          .from('MatchHistory')
          .select('id');
    
        if (error) {
          console.error('Error fetching match history:', error);
          return;
        }
    
        const matchIds = data.map((match) => match.id);
    
        if (matchIds.length === 0) {
          console.log('No previous matches found.');
          return;
        }
    
        const { error: deleteError } = await supabase
          .from('MatchHistory')
          .delete()
          .in('id', matchIds);
    
        if (deleteError) {
          console.error('Error deleting all previous matches:', deleteError);
        } else {
          setMatchHistory([]); // Clear the match history in the state
          console.log('All previous matches deleted successfully.');
        }
      } catch (error) {
        console.error('Error deleting all previous matches:', error);
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
      <button className="delete-button" onClick={handleDeleteAllMatches}>
        Delete All Matches
      </button>

    </div>

   
    <h2>Previous Matches</h2>
    {matchHistory.length > 0 ? (
  <ul>
    {matchHistory.map((match, index) => (
      <li key={index}>
        <span>{match.match}</span>
        <span> Winner: {match.winner}</span>
      </li>
    ))}
  </ul>
  ) : (
      <p>No previous matches found.</p>
    )}

    {/* Button to delete all previous matches */}
    {matchHistory.length > 0 && (
      <button className="delete-button" onClick={handleDeleteAllPreviousMatches}>
        Delete All Previous Matches
      </button>
    )}


    </div>
  );
  
}


export default App;
