import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Auth from './pages/Auth.jsx';
import AuthorDashboard from './pages/Author.jsx';
import Books from './pages/Books.jsx';
import { TicketList, NewTicket, TicketDetail } from './pages/Tickets.jsx';

function RootRedirect() { return <Navigate to='/login' replace/>; }
export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect/> },
  { path: '/login', element: <Auth/> },
  { path: '/register', element: <Auth mode="register"/> },
  { element: <ProtectedRoute role="author"/>, children: [
    { path: '/author', element: <AuthorDashboard/> },
    { path: '/author/books', element: <Books/> },
    { path: '/author/tickets', element: <TicketList/> },
    { path: '/author/tickets/new', element: <NewTicket/> },
    { path: '/author/tickets/:id', element: <TicketDetail/> }
  ]},
  { path: '*', element: <RootRedirect/> }
]);
