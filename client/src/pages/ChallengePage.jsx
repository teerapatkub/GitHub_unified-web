import React from 'react';
import AiTaskPage from '../components/learning/AiTaskPage';

export default function ChallengePage({ user, onUserRefresh }) {
  return <AiTaskPage mode="challenge" user={user} onUserRefresh={onUserRefresh} />;
}
