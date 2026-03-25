import { LucideIcon } from 'lucide-react-native';
import { cssInterop } from 'react-native-css-interop';

function interopIcon(icon: LucideIcon) {
  cssInterop(icon, {
    className: 'style',
  });
}

export { interopIcon };
