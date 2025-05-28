export const theme = {
  colors: {
    primary: {
      bg: 'bg-[#25D366]', // WhatsApp green
      hover: 'hover:bg-[#128C7E]',
      text: 'text-[#25D366]',
      border: 'border-[#25D366]',
    },
    background: {
      main: 'bg-[#f0efe8]',
      secondary: 'bg-[#f9f7f5]',
      message: 'bg-[#efe7d7]',
    },
    accent: {
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      text: 'text-orange-500',
      border: 'border-orange-500',
    }
  },
  components: {
    button: [
      "transition-all",
      "duration-200",
      "ease-in-out",
      "shadow-sm",
      "hover:shadow-md",
      "rounded-lg",
    ],
    input: [
      "w-full",
      "p-3",
      "border",
      "rounded-lg",
      "focus:outline-none",
      "transition-all",
      "duration-200",
    ],
    card: [
      "bg-white",
      "rounded-lg",
      "shadow-sm",
      "hover:shadow-md",
      "transition-all",
      "duration-200",
    ]
  }
};