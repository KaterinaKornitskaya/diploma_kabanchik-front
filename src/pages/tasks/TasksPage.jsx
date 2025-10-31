import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function TasksPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  return (
    <main className="tasks-page">
      <h1>Завдання</h1>
      <p>Пошук: <strong>{q}</strong></p>

      {/* TODO: запит до API за завданнями */}
    </main>
  );
}