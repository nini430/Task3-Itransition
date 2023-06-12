const crypto = require('crypto');

const isDuplicate=(moves)=>{
    let duplicate=false;
    const uniqueMoves=[];
    moves.forEach(move=>{
        if(uniqueMoves.includes(move)) {
            duplicate=true;
        }else{
            uniqueMoves.push(move);
        }
    })

    return duplicate;
}

const processMove = (userChoice, readline, table, moves, gameRules, hmac) => {
  if (userChoice === '0') {
    console.log('Exiting the game');
    readline.close();
  } else if (userChoice === '?') {
    const tab = table.generateTable();
    console.log(tab);
    readline.question('Enter your move: ',userChoice=>{
        processMove(userChoice,readline,table,moves,gameRules,hmac);
    })
    
  } else if (/^\d+$/.test(userChoice)) {
    const userChoiceIndex = Number(userChoice) - 1;
    const userMove = moves[userChoiceIndex];
    const computerMove = moves[Math.floor(Math.random() * moves.length)];
    if (userChoiceIndex >= 0 && userChoiceIndex < moves.length) {
      console.log(`Hmac : ${hmac.generateHmac(userMove)}`);
      console.log(`Your move - ${userMove}`);
      console.log(`Computer move - ${computerMove}`);
      console.log(gameRules.isWinningMove(userMove, computerMove));
      console.log(`Hmac KEY : ${hmac.key}`);
      readline.close();
    } else {
      console.log('Invalid move, please try again');
      readline.close();
    }
  } else {
    console.log('Invalid Input, Please try again');
    readline.close();
  }
};

class GameRules {
  constructor(moves) {
    this.moves = moves;
    this.moveLength = moves.length;
    this.halfLength = this.moveLength / 2;
  }

  isWinningMove(userMove, computerMove) {
    const userIndex = this.moves.indexOf(userMove);
    const computerIndex = this.moves.indexOf(computerMove);
    const distance =
      (computerIndex - userIndex + this.moveLength) % this.moveLength;
    if (distance === 0) {
      return 'Draw';
    } else if (distance <= this.halfLength) {
      return 'Computer Wins';
    } else {
      return 'You Win';
    }
  }
}

class HmacGenerator {
  constructor(key) {
    this.key = key;
  }

  generateHmac(message) {
    const hmac = crypto
      .createHmac('sha256', this.key)
      .update(message)
      .digest('hex');
    return hmac;
  }
}

class TableGenerator {
  constructor(moves) {
    this.moves = moves;
    this.moveLength = moves.length;
    this.halfLength = moves.length / 2;
  }
  isWinningMove(userMove, computerMove) {
    const userIndex = this.moves.indexOf(userMove);
    const computerIndex = this.moves.indexOf(computerMove);
    const distance =
      (computerIndex - userIndex + this.moveLength) % this.moveLength;
    if (distance === 0) {
      return 'Draw';
    } else if (distance <= this.halfLength) {
      return 'PC Wins';
    } else {
      return 'You Win';
    }
  }

  generateTable() {
    const table = [];
    const headerRow = ['PC Moves', ...this.moves];
    table.push(headerRow);
    const separatorRow = Array(this.moves.length + 1)
      .fill('-')
      .map((char) => char.repeat(10));
    table.push(separatorRow);

    for (let i = 0; i < this.moves.length; i++) {
      const row = [this.moves[i]];

      for (let j = 0; j < this.moves.length; j++) {
        const result = this.isWinningMove(this.moves[i], this.moves[j]);
        row.push(result);
      }
      table.push(row);
    }

    const formattedTable = table
      .map((row) => `| ${row.map((cell) => cell.padEnd(10)).join(' | ')} |`)
      .join('\n');
    const separatorLine = `+${separatorRow.join('+')}+`;
    const finalTable = `${separatorLine}\n${formattedTable}\n${separatorLine}`;
    return finalTable;
  }
}

function playGame(moves) {
 if(moves.length===0) {
    console.error('No moves specified');
    return;
 }else if(moves.length===1) {
    console.error('It\'s not possible to play with only one move');
    return;
 }else if(moves.length%2===0) {
    console.error('Moves count should be odd >=3 non-repeating strings');
    return;
 }else if(isDuplicate(moves)) {
    console.error('Moves should be unique (non-repeating)');
    return;
 }
  const gameRules = new GameRules(moves);
  const table = new TableGenerator(moves);
  const hmac = new HmacGenerator('secretkey');

  console.log('Avaliable moves:');
  moves.forEach((move, index) => {
    console.log(`${index + 1} - ${move}`);
  });
  console.log(`0 - Exit`);
  console.log(`? - Help`);

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('Enter Your Move: ', (userChoice) => {
    processMove(userChoice, readline, table, moves, gameRules, hmac);
  });
}

playGame(process.argv.slice(2));
