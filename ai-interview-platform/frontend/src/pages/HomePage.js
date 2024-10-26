import logo from './logo.svg';
import './App.css';
import Header from './Header.js';




const user = {
  name: 'Hedy Lamarr',
  imageSize: 90,
};


function HomePage() {
  return (
      <div>
      <Header />
      <div className = "App">
      <img App=".profile-info"/>
      <h1> Pre-(inter)-View </h1>
      <MyButton />
      <AboutPage />
      </div>
    </div>
  );
}


function MyComponent() {
  return (
    <div style={{color: 'red', fontSize: '32px'}}>
      This text is red and 32px
    </div>
  );
}


function MyButton() {
  return (
    <div>
      <button> Get Started </button>
    </div>
  );
}


function AboutPage() {
  return (
    <>
      <h2>About Pre-(inter)-View </h2>
      <h3> Our Product </h3>
      <p> We deliver the opportunity for students to prepare for any job interview,
      regardless of background, experience, and industry. By using our platform, you receive automatic
      feedback from AI-powered software on body language, interview answers, and facial expressions.
     
      <br />
      </p>
      <button> Try it now! </ button>
    </>
  );
}


export default App;
