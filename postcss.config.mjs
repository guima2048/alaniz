const config = {
  plugins: [
    "@tailwindcss/postcss",
    // Otimizações básicas para produção
    ...(process.env.NODE_ENV === 'production' ? [
      'autoprefixer'
    ] : [])
  ],
};

export default config;
