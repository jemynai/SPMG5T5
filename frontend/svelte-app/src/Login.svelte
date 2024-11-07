<script>
  import {createEventDispatcher} from 'svelte';
  import config from './config.json';
  import { jwtToken } from './authStore';

  const dispatch = createEventDispatcher();
  let email = '';
  let password = '';

  const loginUser = async () => {
    try {
      const response = await fetch(`${config.base_url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    // jwtToken.set('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    e.preventDefault();
    const token = await loginUser();
    if (token) {
      console.log(token);
      jwtToken.set(token); // Save JWT token in the store
    }
  };
</script>

<div class="hide-overflow">
  <div class="page-container">
    <div class="form-container">
      <form on:submit={handleSubmit}>
        <h1>Log in</h1>
        <label class="text-field">
          Email:
          <input type="email" bind:value={email} placeholder="Input your email" required />
        </label>
        <label class="text-field">
          Password:
          <input type="password" bind:value={password} placeholder="Input your password" required />
        </label>
        <button type="submit">Log in</button>
      </form>
      <div class="form-splash"></div>
    </div>
  </div>
</div>

<style>
  .hide-overflow {
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
  }
  .page-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    &::after {
      
      content: "";
      display: block;
      width: 200%;
      height: 200%;
      position: absolute;
      top: -50%;
      left: -50%;
      background-image: url("/form-splash.jpg");
      background-size: contain;
      transform: rotate(180deg);
      filter: blur(128px);
      z-index: -1;
    }
  }
  .form-container {
    width: 960px;
    height: 640px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    border-radius: 8px;
    -webkit-box-shadow: 2px 2px 12px 2px rgba(0,0,0,0.64);
    -moz-box-shadow: 2px 2px 12px 2px rgba(0,0,0,0.64);
    box-shadow: 2px 2px 12px 2px rgba(0,0,0,0.64);
    overflow: hidden;
    background-color: aliceblue;
  }
  .form-splash {
    display: block;
    background-image: url("/form-splash.jpg");
    background-size: cover;
    height: 100%;
    width: 60%;
  }
  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 36px;
    flex-grow: 1;
  }
  label {
    font-size: 14px;
    display: flex;
    align-items: center;
    margin: 4px 0;
    &.text-field {
      flex-direction: column;
      align-items: stretch;
    }
  }
  input {
    padding: 16px;
    font-size: 12px;
    margin: 4px 0;
    border-radius: 8px;
    &[type=checkbox] {
      margin: 0 4px 0 0;
      accent-color: #3e6b71;
    }
  }
  button {
    margin-top: 16px;
    padding: 12px;
    font-size: 14px;
    transition: all .2s;
    border: none;
    border-radius: 8px;
    background-color: #3e6b71;
    color: aliceblue;
    &:hover {
      cursor: pointer;
    }
  }
</style>