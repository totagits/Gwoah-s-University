import './services/session';
import {createRoot} from 'react-dom/client';
import App from './WorkspaceApp';
import { LocalizationProvider } from './i18n/Localization';
import './index.css';
import './styles/campus.css';

createRoot(document.getElementById('root')!).render(<LocalizationProvider><App /></LocalizationProvider>);
