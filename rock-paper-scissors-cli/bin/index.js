#!/usr/bin/env node

import { program } from 'commander';
import inquirer from '@inquirer/prompts';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Statistics file path
const STATS_FILE = './game-stats.json';

// Initialize or load statistics
let statistics = {
  wins: 0,
  losses: 0,
  ties: 0,
  totalGames: 0
};

// Load existing statistics if available
function loadStatistics() {
  try {
    if (existsSync(STATS_FILE)) {
      const data = readFileSync(STATS_FILE, 'utf8');
      statistics = JSON.parse(data);
    }
  } catch (error) {
    console.log(chalk.yellow('No existing statistics found. Starting fresh.'));
  }
}

// Save statistics to file
function saveStatistics() {
  try {
    writeFileSync(STATS_FILE, JSON.stringify(statistics, null, 2));
  } catch (error) {
    console.error(chalk.red('Error saving statistics:', error.message));
  }
}

// Game logic
const MOVES = {
  rock: { beats: 'scissors', emoji: '🪨' },
  paper: { beats: 'rock', emoji: '📄' },
  scissors: { beats: 'paper', emoji: '✂️' }
};

function getComputerMove() {
  const moves = Object.keys(MOVES);
  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex];
}

function determineWinner(playerMove, computerMove) {
  if (playerMove === computerMove) {
    return 'tie';
  }
  
  if (MOVES[playerMove].beats === computerMove) {
    return 'win';
  }
  
  return 'loss';
}

// Display functions
function displayWelcome() {
  console.log(chalk.bold.cyan('\n🎮 Rock-Paper-Scissors CLI Game 🎮'));
  console.log(chalk.gray('====================================\n'));
}

function displayStatistics() {
  console.log(chalk.bold.yellow('\n📊 Game Statistics 📊'));
  console.log(chalk.gray('=====================\n'));
  
  const winRate = statistics.totalGames > 0 
    ? ((statistics.wins / statistics.totalGames) * 100).toFixed(1)
    : 0;
  
  console.log(chalk.green(🏆 Wins: ${statistics.wins}));
  console.log(chalk.red(💔 Losses: ${statistics.losses}));
  console.log(chalk.blue(🤝 Ties: ${statistics.ties}));
  console.log(chalk.magenta(🎯 Total Games: ${statistics.totalGames}));
  console.log(chalk.cyan(📈 Win Rate: ${winRate}%\n));
}

async function playGame() {
  console.log(chalk.bold.green('\n🕹️  New Game 🕹️'));
  console.log(chalk.gray('================\n'));
  
  try {
    const playerMove = await inquirer.select({
      message: 'Choose your move:',
      choices: [
        { name: ${chalk.gray('🪨')} Rock, value: 'rock' },
        { name: ${chalk.gray('📄')} Paper, value: 'paper' },
        { name: ${chalk.gray('✂️')} Scissors, value: 'scissors' },
        { name: chalk.yellow('↩️  Back to Menu'), value: 'back' }
      ]
    });
    
    if (playerMove === 'back') {
      return;
    }
    
    const computerMove = getComputerMove();
    const result = determineWinner(playerMove, computerMove);
    
    // Display moves
    console.log(chalk.blue(\nYou chose: ${MOVES[playerMove].emoji} ${chalk.bold(playerMove.toUpperCase())}));
    console.log(chalk.red(Computer chose: ${MOVES[computerMove].emoji} ${chalk.bold(computerMove.toUpperCase())}));
    
    // Display result
    switch (result) {
      case 'win':
        console.log(chalk.bold.green('\n🎉 You win!'));
        statistics.wins++;
        break;
      case 'loss':
        console.log(chalk.bold.red('\n😞 You lose!'));
        statistics.losses++;
        break;
      case 'tie':
        console.log(chalk.bold.blue('\n🤝 It\'s a tie!'));
        statistics.ties++;
        break;
    }
    
    statistics.totalGames++;
    saveStatistics();
    
    // Ask to play again
    const playAgain = await inquirer.confirm({
      message: 'Would you like to play another round?',
      default: true
    });
    
    if (playAgain) {
      await playGame();
    }
    
  } catch (error) {
    if (error.message !== 'User force closed the prompt with 0 null') {
      console.error(chalk.red('Error:', error.message));
    }
  }
}

async function resetStatistics() {
  const confirm = await inquirer.confirm({
    message: chalk.yellow('Are you sure you want to reset all statistics?'),
    default: false
  });
  
  if (confirm) {
    statistics = {
      wins: 0,
      losses: 0,
      ties: 0,
      totalGames: 0
    };
    saveStatistics();
    console.log(chalk.green('✅ Statistics have been reset!'));
  } else {
    console.log(chalk.blue('Reset cancelled.'));
  }
}

// Main menu
async function showMainMenu() {
  displayWelcome();
  
  try {
    const choice = await inquirer.select({
      message: 'What would you like to do?',
      choices: [
        { name: ${chalk.green('▶️')} Start New Game, value: 'play' },
        { name: ${chalk.blue('📊')} View Statistics, value: 'stats' },
        { name: ${chalk.yellow('🔄')} Reset Statistics, value: 'reset' },
        { name: ${chalk.red('🚪')} Quit, value: 'quit' }
      ]
    });
    
    switch (choice) {
      case 'play':
        await playGame();
        break;
      case 'stats':
        displayStatistics();
        break;
      case 'reset':
        await resetStatistics();
        break;
      case 'quit':
        console.log(chalk.cyan('\nThanks for playing! Goodbye! 👋\n'));
        process.exit(0);
    }
    
    // Return to main menu unless user quits
    if (choice !== 'quit') {
      await inquirer.input({
        message: chalk.gray('Press Enter to continue...'),
        default: ''
      });
      await showMainMenu();
    }
    
  } catch (error) {
    if (error.message !== 'User force closed the prompt with 0 null') {
      console.error(chalk.red('Error:', error.message));
    }
    console.log(chalk.cyan('\nGoodbye! 👋\n'));
    process.exit(0);
  }
}

// CLI Commands setup
program
  .name('rps-game')
  .description('Rock-Paper-Scissors CLI Game')
  .version('1.0.0');

program
  .command('start')
  .description('Start the interactive Rock-Paper-Scissors game')
  .action(async () => {
    loadStatistics();
    await showMainMenu();
  });

program
  .command('stats')
  .description('Display game statistics')
  .action(() => {
    loadStatistics();
    displayStatistics();
  });

program
  .command('reset')
  .description('Reset game statistics')
  .action(async () => {
    loadStatistics();
    await resetStatistics();
  });

program
  .command('play')
  .description('Play a single game directly')
  .argument('[move]', 'Your move (rock, paper, or scissors)', '')
  .action(async (move) => {
    loadStatistics();
    
    const validMoves = Object.keys(MOVES);
    let playerMove = move.toLowerCase();
    
    if (!validMoves.includes(playerMove)) {
      try {
        playerMove = await inquirer.select({
          message: 'Choose your move:',
          choices: validMoves.map(m => ({
            name: ${MOVES[m].emoji} ${m.charAt(0).toUpperCase() + m.slice(1)},
            value: m
          }))
        });
      } catch (error) {
        console.log(chalk.red('Move selection cancelled.'));
        return;
      }
    }
    
    const computerMove = getComputerMove();
    const result = determineWinner(playerMove, computerMove);
    
    console.log(chalk.blue(\nYou chose: ${MOVES[playerMove].emoji} ${chalk.bold(playerMove.toUpperCase())}));
    console.log(chalk.red(Computer chose: ${MOVES[computerMove].emoji} ${chalk.bold(computerMove.toUpperCase())}));
    
    switch (result) {
      case 'win':
        console.log(chalk.bold.green('\n🎉 You win!'));
        statistics.wins++;
        break;
      case 'loss':
        console.log(chalk.bold.red('\n😞 You lose!'));
        statistics.losses++;
        break;
      case 'tie':
        console.log(chalk.bold.blue('\n🤝 It\'s a tie!'));
        statistics.ties++;
        break;
    }
    
    statistics.totalGames++;
    saveStatistics();
    
    console.log(chalk.gray('\nUpdated Statistics:'));
    console.log(chalk.green(Wins: ${statistics.wins}));
    console.log(chalk.red(Losses: ${statistics.losses}));
    console.log(chalk.blue(Ties: ${statistics.ties}));
  });

// Handle no command provided
if (process.argv.length <= 2) {
  loadStatistics();
  showMainMenu();
} else {
  program.parse();
}