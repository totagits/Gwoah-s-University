import './services/session';
import {createRoot} from 'react-dom/client';
import App from './App';
import { LocalizationProvider } from './i18n/Localization';
import './index.css';
import './styles/campus.css';

createRoot(document.getElementById('root')!).render(<LocalizationProvider><App /></LocalizationProvider>);

if('serviceWorker' in navigator&&window.isSecureContext){
 window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js',{scope:'/'})
  .catch(error=>console.warn('HIAU PWA registration unavailable',error));});
}
