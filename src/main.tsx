import './services/session';
import {createRoot} from 'react-dom/client';
import App from './App';
import { LocalizationProvider } from './i18n/Localization';
import './index.css';
import './styles/campus.css';
import {registerPwaUpdates} from './pwa/updateGuard';

createRoot(document.getElementById('root')!).render(<LocalizationProvider><App /></LocalizationProvider>);

window.addEventListener('load',()=>{void registerPwaUpdates();});
