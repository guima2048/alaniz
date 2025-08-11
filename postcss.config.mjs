const config = {
  plugins: [
    "@tailwindcss/postcss",
    // Otimizações adicionais para produção
    ...(process.env.NODE_ENV === 'production' ? [
      'autoprefixer',
      'cssnano'
    ] : [])
  ],
};

export default config;
