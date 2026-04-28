import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, ArrowRight, Share2 } from 'lucide-react';
import { useQuizStore } from '@/store';
import type { QuizCategory, QuizQuestion } from '@/types';
import styles from './QuizCategoryPage.module.css';

const ALL_QUESTIONS: QuizQuestion[] = [
  { id:'q1', category:'voting-process', question:'On which day of the week must federal Election Day fall?', options:['Monday','Tuesday','Wednesday','Thursday'], correctAnswer:1, explanation:'By federal law, Election Day is always on the first Tuesday after the first Monday in November.', difficulty:'easy' },
  { id:'q2', category:'voting-process', question:'What is the minimum voting age in the United States?', options:['16','17','18','21'], correctAnswer:2, explanation:'The 26th Amendment (1971) lowered the voting age to 18 for all federal, state, and local elections.', difficulty:'easy' },
  { id:'q3', category:'voting-process', question:'Which federal agency maintains the National Voter Registration database?', options:['FEC','EAC','FCC','DOJ'], correctAnswer:1, explanation:'The Election Assistance Commission (EAC) maintains the national voter registration system and guidelines.', difficulty:'medium' },
  { id:'q4', category:'voting-process', question:'What is a "provisional ballot"?', options:['A ballot cast before Election Day','A ballot cast when a voter\'s registration is in question','A ballot for military voters','A blank practice ballot'], correctAnswer:1, explanation:'Provisional ballots are given when there are questions about a voter\'s eligibility; they are counted after verification.', difficulty:'medium' },
  { id:'q5', category:'voting-process', question:'What is the purpose of voter ID laws?', options:['To prevent voter fraud','To speed up the voting process','To increase voter turnout','To eliminate mail-in ballots'], correctAnswer:0, explanation:'Voter ID laws require voters to present identification to verify their identity at the polls, intended to prevent in-person voter fraud.', difficulty:'easy' },
  { id:'q6', category:'voting-process', question:'Which constitutional amendment gave women the right to vote?', options:['15th','19th','24th','26th'], correctAnswer:1, explanation:'The 19th Amendment (1920) prohibited denying the right to vote on the basis of sex.', difficulty:'easy' },
  { id:'q7', category:'voting-process', question:'What does "absentee voting" mean?', options:['Voting without registration','Voting by mail or before Election Day','Voting in another state','Voting by proxy'], correctAnswer:1, explanation:'Absentee voting allows registered voters to cast ballots by mail or in person before Election Day without going to their polling place.', difficulty:'easy' },
  { id:'q8', category:'voting-process', question:'Which amendment abolished poll taxes in federal elections?', options:['19th','22nd','24th','26th'], correctAnswer:2, explanation:'The 24th Amendment (1964) abolished poll taxes, which had been used to disenfranchise Black voters and low-income citizens.', difficulty:'medium' },
  { id:'q9', category:'voting-process', question:'What is "ballot harvesting"?', options:['Destroying invalid ballots','Collecting and submitting ballots on behalf of other voters','Counting ballots twice','Reusing old ballots'], correctAnswer:1, explanation:'Ballot harvesting refers to the practice of collecting completed absentee ballots from voters and submitting them. It is legal in some states and illegal in others.', difficulty:'hard' },
  { id:'q10', category:'voting-process', question:'How often are US Presidential elections held?', options:['Every 2 years','Every 4 years','Every 6 years','Every 8 years'], correctAnswer:1, explanation:'US Presidential elections are held every four years, in years divisible by four, as specified in Article II of the Constitution.', difficulty:'easy' },
  { id:'q11', category:'electoral-system', question:'How many total electoral votes are there in the US Electoral College?', options:['435','538','535','270'], correctAnswer:1, explanation:'There are 538 electoral votes total — 435 for House seats, 100 for Senate seats, and 3 for Washington D.C. (23rd Amendment).', difficulty:'easy' },
  { id:'q12', category:'electoral-system', question:'How many electoral votes does a candidate need to win the presidency?', options:['435','269','270','300'], correctAnswer:2, explanation:'A candidate needs at least 270 electoral votes — a simple majority of 538 — to win the presidency.', difficulty:'easy' },
  { id:'q13', category:'electoral-system', question:'What happens if no presidential candidate reaches 270 electoral votes?', options:['The candidate with the most votes wins','The House of Representatives chooses the President','The Senate chooses the President','A new election is held'], correctAnswer:1, explanation:'If no candidate reaches 270, the House of Representatives selects the President (each state delegation gets one vote), per the 12th Amendment.', difficulty:'hard' },
  { id:'q14', category:'electoral-system', question:'Which states use a "congressional district method" instead of winner-take-all?', options:['Texas and Florida','Maine and Nebraska','California and New York','Ohio and Pennsylvania'], correctAnswer:1, explanation:'Maine and Nebraska allocate electoral votes by congressional district rather than using the winner-take-all method used by all other states.', difficulty:'hard' },
  { id:'q15', category:'electoral-system', question:'When do presidential electors meet to cast their official votes?', options:['Election Day','The week after Election Day','The first Tuesday of December','The first Tuesday after the second Wednesday in December'], correctAnswer:3, explanation:'Federal law sets the date for electors to meet as the first Tuesday after the second Wednesday in December, about six weeks after Election Day.', difficulty:'hard' },
  { id:'q16', category:'electoral-system', question:'What is a "faithless elector"?', options:['An elector who refuses to participate','An elector who votes differently than pledged','An elector who is not a citizen','An elector appointed by the wrong party'], correctAnswer:1, explanation:'A faithless elector is one who votes for a different candidate than the one they pledged to support. Most states have laws penalizing or preventing this.', difficulty:'medium' },
  { id:'q17', category:'electoral-system', question:'Which constitutional amendment created the current presidential succession framework?', options:['20th','22nd','25th','27th'], correctAnswer:2, explanation:'The 25th Amendment (1967) established the process for presidential succession and the procedures for when a president becomes incapacitated.', difficulty:'medium' },
  { id:'q18', category:'electoral-system', question:'The Electoral College was established by which document?', options:['The Bill of Rights','The Declaration of Independence','The US Constitution','The Federalist Papers'], correctAnswer:2, explanation:'Article II of the US Constitution created the Electoral College system for selecting the President and Vice President.', difficulty:'easy' },
  { id:'q19', category:'electoral-system', question:'How many US Senators does each state have?', options:['1','2','3','Depends on population'], correctAnswer:1, explanation:'Every state has exactly two US Senators, regardless of population, giving each state equal representation in the Senate.', difficulty:'easy' },
  { id:'q20', category:'electoral-system', question:'Congressional districts are redrawn every how many years?', options:['2','4','8','10'], correctAnswer:3, explanation:'Congressional districts are redrawn every 10 years following the decennial census, a process called redistricting or reapportionment.', difficulty:'medium' },
  { id:'q21', category:'rights-responsibilities', question:'The First Amendment protects freedom of speech, religion, press, assembly, and what else?', options:['Right to vote','Right to petition the government','Right to bear arms','Right to privacy'], correctAnswer:1, explanation:'The First Amendment protects five freedoms: religion, speech, press, assembly, and the right to petition the government for a redress of grievances.', difficulty:'medium' },
  { id:'q22', category:'rights-responsibilities', question:'Which amendment protects against unreasonable searches and seizures?', options:['2nd','3rd','4th','5th'], correctAnswer:2, explanation:'The 4th Amendment protects citizens from unreasonable searches and seizures and requires warrants to be supported by probable cause.', difficulty:'medium' },
  { id:'q23', category:'rights-responsibilities', question:'What is the primary civic responsibility of US citizens?', options:['Joining the military','Paying taxes','Serving on juries','Voting'], correctAnswer:3, explanation:'While voting is not legally mandatory in the US, it is widely considered the primary civic duty of citizens in a democracy.', difficulty:'easy' },
  { id:'q24', category:'rights-responsibilities', question:'The 15th Amendment (1870) prohibited denying voting rights based on what?', options:['Sex','Age','Race, color, or previous servitude','Property ownership'], correctAnswer:2, explanation:'The 15th Amendment prohibited federal and state governments from denying a citizen the right to vote based on race, color, or previous condition of servitude.', difficulty:'medium' },
  { id:'q25', category:'rights-responsibilities', question:'What is "gerrymandering"?', options:['A type of voting fraud','Manipulating district boundaries for political advantage','A form of voter suppression through long lines','Requiring photo ID to vote'], correctAnswer:1, explanation:'Gerrymandering is the practice of drawing electoral district boundaries to give one political party an unfair advantage over others.', difficulty:'medium' },
  { id:'q26', category:'election-history', question:'Who was the first US President?', options:['John Adams','Benjamin Franklin','George Washington','Thomas Jefferson'], correctAnswer:2, explanation:'George Washington was unanimously elected as the first President of the United States in 1788-1789 and served two terms.', difficulty:'easy' },
  { id:'q27', category:'election-history', question:'Which election introduced the popular vote for presidential electors?', options:['1788','1800','1824','1828'], correctAnswer:3, explanation:'In 1828, Andrew Jackson\'s election saw most states adopt popular voting for presidential electors rather than state legislature selection.', difficulty:'hard' },
  { id:'q28', category:'election-history', question:'Who won the 2000 presidential election after a Supreme Court ruling?', options:['Al Gore','George W. Bush','Ralph Nader','Pat Buchanan'], correctAnswer:1, explanation:'George W. Bush won after the Supreme Court\'s ruling in Bush v. Gore stopped the Florida recount, giving Bush Florida\'s electoral votes.', difficulty:'medium' },
  { id:'q29', category:'election-history', question:'The US has how many major political parties that regularly win presidential elections?', options:['1','2','3','4'], correctAnswer:1, explanation:'The US operates under a two-party system where the Democratic and Republican parties have dominated presidential elections since the 1850s.', difficulty:'easy' },
  { id:'q30', category:'election-history', question:'Which president won the most electoral votes in a single election?', options:['Franklin D. Roosevelt','Ronald Reagan','George Washington','Richard Nixon'], correctAnswer:1, explanation:'Ronald Reagan won 525 of 538 electoral votes in 1984, defeating Walter Mondale in a historic landslide. (Washington ran unopposed.)', difficulty:'hard' },
  { id:'q31', category:'how-government-works', question:'How many branches of government does the US have?', options:['2','3','4','5'], correctAnswer:1, explanation:'The US has three branches: Legislative (Congress), Executive (President), and Judicial (Supreme Court) — established by the Constitution.', difficulty:'easy' },
  { id:'q32', category:'how-government-works', question:'How long is a US Senator\'s term?', options:['2 years','4 years','6 years','8 years'], correctAnswer:2, explanation:'US Senators serve 6-year terms, with one-third of the Senate up for election every two years to ensure continuity.', difficulty:'easy' },
  { id:'q33', category:'how-government-works', question:'How many justices sit on the US Supreme Court?', options:['7','8','9','11'], correctAnswer:2, explanation:'The Supreme Court has 9 justices — one Chief Justice and eight Associate Justices. This number is set by Congress, not the Constitution.', difficulty:'easy' },
  { id:'q34', category:'how-government-works', question:'What is the process of impeachment?', options:['The House charges, the Senate tries','The Senate charges, the House tries','The Supreme Court removes the president','Congress votes to remove directly'], correctAnswer:0, explanation:'The House of Representatives votes to impeach (charge), then the Senate holds a trial. A two-thirds Senate vote is needed for removal.', difficulty:'medium' },
  { id:'q35', category:'how-government-works', question:'How long is a US House Representative\'s term?', options:['1 year','2 years','4 years','6 years'], correctAnswer:1, explanation:'Members of the House of Representatives serve 2-year terms and the entire House is up for election every two years (midterm and presidential).', difficulty:'easy' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const QuizCategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { t } = useTranslation();
  const { setQuestions, selectAnswer, nextQuestion, currentQuestionIndex, currentQuestions, selectedAnswer, completeQuiz, isCompleted, resetQuiz } = useQuizStore();

  const [started, setStarted] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const categoryQuestions = ALL_QUESTIONS.filter(q => q.category === category);
  const catName = t(`quiz.categories.${category}`);

  const handleStart = () => {
    const questions = shuffle(categoryQuestions).slice(0, 10);
    resetQuiz();
    setQuestions(questions);
    setLocalScore(0);
    setStarted(true);
    setShowExplanation(false);
  };

  const currentQ = currentQuestions[currentQuestionIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQ?.correctAnswer;

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    selectAnswer(idx);
    if (idx === currentQ.correctAnswer) setLocalScore(s => s + 1);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestionIndex >= currentQuestions.length - 1) {
      completeQuiz({ category: category as QuizCategory, score: localScore, totalQuestions: currentQuestions.length, answeredAt: new Date(), timeSpent: 0 });
    } else {
      nextQuestion();
    }
  };

  if (!started) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className="section-container">
            <Link to="/quiz" className={styles.back}>← Back to Quiz Hub</Link>
            <h1>{catName}</h1>
            <p>10 questions · Test your knowledge and earn a badge</p>
          </div>
        </div>
        <div className={`section-container section-padding ${styles.centered}`}>
          <div className={`card ${styles.startCard}`}>
            <div className={styles.startEmoji}>🧠</div>
            <h2>Ready to test your knowledge?</h2>
            <p>You'll answer 10 questions on <strong>{catName}</strong>. Each question has one correct answer with an explanation.</p>
            <button className="btn btn-primary" onClick={handleStart} id="start-quiz-btn">
              {t('quiz.startQuiz')} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const pct = Math.round((localScore / currentQuestions.length) * 100);
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className="section-container">
            <h1>Quiz Complete!</h1>
          </div>
        </div>
        <div className={`section-container section-padding ${styles.centered}`}>
          <div className={`card ${styles.resultsCard}`}>
            <div className={styles.resultEmoji}>{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📚'}</div>
            <h2>{t('quiz.score')}</h2>
            <div className={styles.scoreDisplay}>{localScore}/{currentQuestions.length}</div>
            <div className={styles.scorePct}>{pct}%</div>
            <p>{pct >= 80 ? 'Excellent! You know your civics!' : pct >= 60 ? 'Good job! Keep learning!' : 'Keep practicing — you\'ll get there!'}</p>
            <div className={styles.resultBtns}>
              <button className="btn btn-primary" onClick={handleStart}>Try Again</button>
              <Link to="/quiz" className="btn btn-secondary">Back to Quiz Hub</Link>
              <button className="btn btn-ghost" onClick={() => { void navigator.clipboard.writeText(`I scored ${localScore}/${currentQuestions.length} on ElectEd's ${catName} quiz! Try it at elected.app`); }}>
                <Share2 size={14} /> {t('quiz.shareResults')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="section-container">
          <Link to="/quiz" className={styles.back}>← Back to Quiz Hub</Link>
          <h1>{catName}</h1>
        </div>
      </div>
      <div className={`section-container ${styles.quizArea}`}>
        <div className={styles.progressBar} role="progressbar" aria-valuenow={currentQuestionIndex} aria-valuemax={currentQuestions.length} aria-label="Quiz progress">
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.qCount}>Question {currentQuestionIndex + 1} of {currentQuestions.length}</div>

        {currentQ && (
          <div className={`card ${styles.questionCard}`}>
            <h2 className={styles.questionText}>{currentQ.question}</h2>
            <div className={styles.options} role="list">
              {currentQ.options.map((opt, idx) => {
                let cls = styles.option;
                if (isAnswered) {
                  if (idx === currentQ.correctAnswer) cls += ` ${styles.optionCorrect}`;
                  else if (idx === selectedAnswer) cls += ` ${styles.optionWrong}`;
                }
                return (
                  <button key={idx} className={cls} onClick={() => handleAnswer(idx)} disabled={isAnswered} aria-label={`Option ${idx + 1}: ${opt}`} role="listitem">
                    <span className={styles.optionLetter}>{['A','B','C','D'][idx]}</span>
                    <span>{opt}</span>
                    {isAnswered && idx === currentQ.correctAnswer && <CheckCircle size={16} aria-hidden="true" />}
                    {isAnswered && idx === selectedAnswer && idx !== currentQ.correctAnswer && <XCircle size={16} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className={`${styles.explanation} ${isCorrect ? styles.explanationCorrect : styles.explanationWrong}`} role="alert" aria-live="polite">
                <strong>{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</strong>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            {isAnswered && (
              <button className="btn btn-primary" onClick={handleNext} id="next-question-btn">
                {currentQuestionIndex >= currentQuestions.length - 1 ? 'View Results' : t('quiz.nextQuestion')}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCategoryPage;
