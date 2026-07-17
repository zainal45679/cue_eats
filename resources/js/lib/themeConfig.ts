import { AppSettings } from "@/config";

export const applyThemeColor = (
  color: string = AppSettings.themeColor,
  isDarkForeground = AppSettings.isDarkForeground
) => {
  const r = Number.parseInt(color.slice(1, 3), 16);
  const g = Number.parseInt(color.slice(3, 5), 16);
  const b = Number.parseInt(color.slice(5, 7), 16);

  const lightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  const foregroundColor =
    (isDarkForeground ?? lightness > 0.5) ? "#000000" : "#ffffff";

  const style = document.createElement("style");
  style.innerHTML = `
        :root {
            --primary: ${color} !important;
            --primary-foreground: ${foregroundColor} !important;
            --ring: ${color} !important;
            --sidebar-primary: ${color} !important;
        }
        
        .bg-primary {
            background-color: ${color} !important;
        }
        
        .text-primary {
            color: ${color} !important;
        }
        
        .border-primary {
            border-color: ${color} !important;
        }
        
        .ring-primary {
            --tw-ring-color: ${color} !important;
        }
        
        button[data-variant="default"], 
        .btn-primary,
        .bg-primary {
            background-color: ${color} !important;
            color: ${foregroundColor} !important;
        }
        
        button[data-variant="default"]:hover,
        .btn-primary:hover {
            background-color: ${color}dd !important;
        }
        
        /* Sidebar primary colors */
        .sidebar [data-active="true"] {
            background-color: ${color}20 !important;
            color: ${color} !important;
        }
    `;

  const existingStyle = document.getElementById("app-theme-style");
  if (existingStyle) {
    existingStyle.remove();
  }

  style.id = "app-theme-style";
  document.head.appendChild(style);
};
