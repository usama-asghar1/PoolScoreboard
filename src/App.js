import './App.css';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

function App() {
  const supabase = createClient(
    'https://qtbpuorcjlcsjhafilvp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YnB1b3Jjamxjc2poYWZpbHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE1MDk0NjMsImV4cCI6MjAwNzA4NTQ2M30.gBDPmDDgpZN3VUA_TodJZm5_9AJ3_etDsmk7Vii_JSQ',
    {
      prefer: 'single',
    }
  );

  const [tableData, setTableData] = useState([]);
  const [currentMatch, setCurrentMatch] = useState('');
  const [isMatchOver, setIsMatchOver] = useState(false);


  /* eslint-disable react-hooks/exhaustive-deps */

  useEffect(() => {
    fetchTableData();
  }, []);

  
  /* eslint-disable react-hooks/exhaustive-deps */
  
  /* eslint-disable react-hooks/exhaustive-deps */

  useEffect(() => {
    fetchCurrentMatch();
  }, [tableData]);

  
  /* eslint-disable react-hooks/exhaustive-deps */

  const fetchTableData = async () => {
    try {
      const { data, error } = await supabase
        .from('Leaderboard')
        .select('*')
        .order('Wins', { ascending: false });

      if (error) {
        console.error('Error fetching table data:', error);
      } else {
        setTableData(data);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  const fetchCurrentMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('CurrentMatch')
        .select('CurrentMatch')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching current match:', error);
      } else {
        setCurrentMatch(data?.CurrentMatch || '');
      }
    } catch (error) {
      console.error('Error fetching current match:', error);
    }
  };

  const generateMatches = () => {
    const matches = [];

    for (let i = 0; i < tableData.length; i++) {
      const person1 = tableData[i].Name;

      for (let j = i + 1; j < tableData.length; j++) {
        const person2 = tableData[j].Name;

        const match1 = `${person1} vs ${person2}`;
        const match2 = `${person2} vs ${person1}`;

        if (
          !finishedMatches.includes(match1) &&
          !finishedMatches.includes(match2) &&
          !matches.includes(match1) &&
          !matches.includes(match2) &&
          match1 !== currentMatch &&
          match2 !== currentMatch
        ) {
          matches.push(match1);
        }
      }
    }

    return matches;
  };

  const [winners, setWinners] = useState({});

  const handleWinnerSelect = (match, winner) => {
    setWinners((prevState) => ({
      ...prevState,
      [match]: winner,
    }));
    updateCurrentMatch(match);
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
        .from('MatchHistory')
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

  const updateCurrentMatch = async (match) => {
    try {
      // Fetch the previous current match
      const { data: prevData, error: prevError } = await supabase
        .from('CurrentMatch')
        .select('*')
        .single();

      if (prevError) {
        console.error('Error fetching previous current match:', prevError);
        return;
      }

      if (prevData) {
        // Update the existing current match
        await supabase
          .from('CurrentMatch')
          .update({ CurrentMatch: match })
          .eq('id', prevData.id);
      } else {
        // Insert the new current match
        await supabase.from('CurrentMatch').insert([{ CurrentMatch: match }]);
      }

      console.log('Current match updated in CurrentMatch table successfully.');
      setCurrentMatch(match);
      setIsMatchOver(false); // Reset isMatchOver to false
    } catch (error) {
      console.error('Error updating current match:', error);
    }
  };

  
  const handleSubmit = async (match) => {
    const [person1, person2] = match.split(' vs ');
    const winner = winners[match];
  
    if (winner) {
      const loser = winner === person1 ? person2 : person1;
  
      await Promise.all([updateWins(winner), updateLosses(loser)]);
      await fetchTableData();
  
      try {
        await supabase.from('FinishedMatches').insert([{ match, winner }]);
        console.log('Match result stored in FinishedMatches table successfully.');
        setFinishedMatches((prevState) => [...prevState, match]);
      } catch (error) {
        console.error('Error storing match result:', error);
      }
  
      try {
        await supabase.from('MatchHistory').insert([{ match, winner }]);
        console.log('Match result stored in MatchHistory table successfully.');
        await fetchMatchHistory();
      } catch (error) {
        console.error('Error storing match result:', error);
      }
  
      updateCurrentMatch(match);
      setWinners((prevState) => ({ ...prevState, [match]: winner }));
      setTimeout(() => {
        setIsMatchOver(true);
      }, 1000);

      try {
        // Fetch the current match data
        const { data, error } = await supabase
          .from('CurrentMatch')
          .select('*')
          .single();
    
        if (error) {
          console.error('Error fetching current match:', error);
          return;
        }
    
        if (data) {
          // Delete the current match record
          const { error: deleteError } = await supabase
            .from('CurrentMatch')
            .delete()
            .eq('id', data.id);
    
          if (deleteError) {
            console.error('Error deleting current match:', deleteError);
          } else {
            console.log('Current match deleted successfully.');
            
            // Insert a new row with 'None' as the value for CurrentMatch
            try {
              const { error: insertError } = await supabase
                .from('CurrentMatch')
                .insert([{ CurrentMatch: 'None' }]);
              
              if (insertError) {
                console.error('Error inserting new row:', insertError);
              } else {
                console.log('New row inserted successfully.');
                setCurrentMatch('None'); // Set the current match state to 'None'
                setIsMatchOver(false); // Reset isMatchOver to false
              }
            } catch (insertError) {
              console.error('Error inserting new row:', insertError);
            }
          }
        } else {
          console.log('No current match to delete.');
        }
      } catch (error) {
        console.error('Error deleting current match:', error);
      }
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
  
    // const handleDeleteAllMatches = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('FinishedMatches')
    //       .select('id');
    
    //     if (error) {
    //       console.error('Error fetching match data:', error);
    //       return;
    //     }
    
    //     const matchIds = data.map((match) => match.id);
    
    //     if (matchIds.length === 0) {
    //       console.log('No matches found.');
    //       return;
    //     }
    
    //     const { error: deleteError } = await supabase
    //       .from('FinishedMatches')
    //       .delete()
    //       .in('id', matchIds);
    
    //     if (deleteError) {
    //       console.error('Error deleting all matches:', deleteError);
    //     } else {
    //       setFinishedMatches([]); // Clear the finishedMatches state
    //       console.log('All matches deleted successfully.');
    //     }
    //   } catch (error) {
    //     console.error('Error deleting all matches:', error);
    //   }
    // };
    
    
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
          console.log('No previous matches.');
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
      <h1>Pool Scoreboard</h1>
      <table className="centered-table">
        <thead>
          <tr className="table-heading">
          <th className="table-heading">Name</th>
          <th className="table-heading">Played</th>
          <th className="table-heading">Wins</th>
          <th className="table-heading">Losses</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{row.Name}</td>
              <td>{row.Wins + row.Losses}</td>
              <td>{row.Wins}</td>
              <td>{row.Losses}</td>
                <button className="delete-button" onClick={() => handleDeletePlayer(row)}>
        Delete ❌
      </button>
            </tr>
          ))}
        </tbody>
      </table>
                <button className="add-player-button" onClick={handleAddPlayer}>
      Add Player
    </button>

      <h2>Current Match</h2>

    {isMatchOver ? (
      <p>None</p>
    ) : (
      <div>
        {currentMatch === 'None' ? (
          <div>
            <p>{currentMatch}</p>
          </div>
        ) : (
          <div>
            <p>{currentMatch}</p>
            <select
              className="select-dropdown"
              value={winners[currentMatch] || ''}
              onChange={(e) =>
                handleWinnerSelect(currentMatch, e.target.value)
              }
            >
              <option value="">Choose winner</option>
              <option value={currentMatch.split(' vs ')[0]}>
                {currentMatch.split(' vs ')[0]}
              </option>
              <option value={currentMatch.split(' vs ')[1]}>
                {currentMatch.split(' vs ')[1]}
              </option>
            </select>
            <button
              className="submit-button"
              disabled={!winners[currentMatch]}
              onClick={() => handleSubmit(currentMatch)}
            >
              Submit
            </button>
            
          </div>
        )}
      </div>
    )}


    <h2>All Matches</h2>
<div className="matches-container">
  {generateMatches().length > 0 ? (
    <ul>
      {generateMatches().map((match, index) => (
        <li key={index}>
          <span>{match}</span>
          <button
            className="select-button"
            onClick={() => updateCurrentMatch(match)}
          >
            Select
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p>No matches.</p>
  )}

          {/* <button className="delete-button" onClick={handleDeleteAllMatches}>
    Delete All Matches
  </button> */}
      </div>

      <h2>Previous Matches</h2>
      {matchHistory.length > 0 ? (
        <ul>
          {matchHistory.map((match, index) => (
            <li key={index}>
              <span>{match.match}</span>
              <span className="winner"> Winner: {match.winner}</span>
            </li>
          ))}
        </ul>
        
      ) : (
        <p>No previous matches.</p>
      )}

    
    {matchHistory.length > 0 && (
      <button className="delete-button" onClick={handleDeleteAllPreviousMatches}>
        Delete All Previous Matches
      </button>
    )} 

    </div>
  );
}
export default App;
