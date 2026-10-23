import { configureStore, createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth', initialState: { user: null, ready: false },
  reducers: {
    setCredentials(state, action) { state.user = action.payload.user; state.ready = true; },
    setUser(state, action) { state.user = action.payload; state.ready = true; },
    logout(state) { state.user = null; state.ready = true; }
  }
});
const ticketSlice = createSlice({ name: 'tickets', initialState: { items: [], loading: false, error: null }, reducers: {
  ticketsLoading(state) { state.loading = true; state.error = null; },
  ticketsLoaded(state, action) { state.items = action.payload; state.loading = false; },
  ticketsFailed(state, action) { state.loading = false; state.error = action.payload; },
  ticketUpserted(state, action) { const ticket = action.payload; const i = state.items.findIndex(x => x._id === ticket._id); if (i < 0) state.items.unshift(ticket); else state.items[i] = ticket; }
}});
export const { setCredentials, setUser, logout } = authSlice.actions;
export const { ticketsLoading, ticketsLoaded, ticketsFailed, ticketUpserted } = ticketSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer, tickets: ticketSlice.reducer } });