let config;
try {

  config = {
      base_url: process.env.BASE_URL
    };
} catch {
  config = {
    base_url: 'http://localhost:5000'
  };
}
  
  export default config;