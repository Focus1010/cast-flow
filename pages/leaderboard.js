import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Count scheduled posts per user and rank top 50
        const { data, error } = await supabase.rpc('get_top_users', { limit_count: 50 });
        if (error) throw error;
        setLeaderboard(data || []);
      } catch (error) {
        console.error("Leaderboard fetch failed:", error.message);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // If you don't have a stored procedure yet, use this raw query instead
  // Note: Requires Supabase to have a 'users' table with fid and a 'scheduled_posts' table with user_id
  /*
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('user_id, count', { count: 'exact' })
    .group('user_id')
    .order('count', { ascending: false })
    .limit(50)
    .then(result => {
      if (error) throw error;
      return result.data.map(row => ({
        user_id: row.user_id,
        post_count: row.count
      }));
    });
  */

  return (
    <div className="leaderboard-page">
      <h2 className="leaderboard-title">Top 50 Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : leaderboard.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <ul className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <li key={entry.user_id || entry.fid} className="leaderboard-item">
              <span className="rank">{index + 1}</span>
              <span className="address">User FID: {entry.user_id || entry.fid}</span>
              <span className="metric">Posts: {entry.post_count || entry.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}