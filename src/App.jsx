import React from 'react';
import './App.css';

const emptySudoku = [
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
];

const solveSudoku = async (sudoku, setSudoku) => {
  const isValid = (row, col, num) => {
    // 判断行里是否重复
    for (let i = 0; i < 9; i++) {
      if (sudoku[row][i] === num) {
          return false
      }
    }
    // 判断列里是否重复
    for (let i = 0; i < 9; i++) {
      if (sudoku[i][col] === num) {
          return false
      }
    }
    // 判断九宫格里是否重复
    const startRow = parseInt(row / 3) * 3
    const startCol = parseInt(col / 3) * 3
    for (let i = startRow; i < startRow + 3; i++) { // 判断9方格里是否重复
        for (let j = startCol; j < startCol + 3; j++) {
            if (sudoku[i][j] === num) {
                return false
            }
        }
    }
    return true
  }
  const solve = async (row, col) => {
    if (col >= 9) {
      // 超过第九列，表示这一行已经结束了
      // 需要另起一行
      col = 0
      row += 1
      if (row >= 9) {
        // 另起一行，超过第九行，则整个数独已经做完
        return true
      }
    }

    if (sudoku[row][col] !== '.') {
      // 已经填过了，填后面的格子
      return solve(row, col + 1)
    }

    for (let num = 1; num <= 9; num++) {
      // 监测行、列、九宫格内是否存在该数字
      if (!isValid(row, col, num.toString())) {
        continue
      }

      // 填充数字
      await setSudoku(row, col, num.toString())

      // 填后面的格子
      if (await solve(row, col + 1)) {
        return true
      }

      // 如果填失败了，则进行回溯
      await setSudoku(row, col, '.')
    }

    return false
  }
  await solve(0, 0)
}

const genSudoku = async (diff = 0) => {
  const genRandom = () => Math.ceil(Math.random() * 9)
  const sudoku = JSON.parse(JSON.stringify(emptySudoku))

  sudoku[0][0] = genRandom() // 第一个空随机填

  await solveSudoku(sudoku, (row, col, num) => {
    sudoku[row][col] = num
  })

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // 如果随机数大于 5，把格子置空
      if (genRandom() > 5 - diff) {
        sudoku[row][col] = '.'
      }
    }
  }

  return sudoku
}

class App extends React.Component {
  state = {
    diff: 0,
    sudoku: emptySudoku
  }

  start = () => {
    genSudoku(this.state.diff).then(sudoku => {
      this.setState({
        sudoku
      })
    })
  }

  solve = async () => {
    const { sudoku } = this.state
    const setSudoku = async (row, col, value) => {
      sudoku[row][col] = value
      return new Promise(resolve => {
        setTimeout(() => {
          this.setState({
            sudoku
          }, () => resolve())
        })
      })
    }
    await solveSudoku(sudoku, setSudoku)
  }

  setDiff = (evt) => {
    this.setState({ diff: Number(evt.target.value) })
    this.start()
  }

  componentDidMount () {
    this.start()
  }

  render() {
    const { sudoku } = this.state
    return (
      <div className="container">
        <div className="wrapper">
          {Array.isArray(sudoku) ? sudoku.map((list, row) => (
            <div className="row" key={`row-${row}`}>
              {/* 遮挡1/3 */}
              {list.map((item, col) => (
                <span key={`box-${col}`}>{ item !== '.' && item }</span>
              ))}
            </div>
          )): <div>数组生成中……</div>}
          <div className="btngroup">
            难度：
            <input
              type="radio" id="easy-radio"
              name="diff" value="0"
              checked={this.state.diff === 0} 
              onChange={this.setDiff}
            />
            <label htmlFor="easy-radio">简单</label>

            <input
              type="radio" id="medium-radio"
              name="diff" value="1"
              checked={this.state.diff === 1}
              onChange={this.setDiff}
            />
            <label htmlFor="medium-radio">中等</label>

            <input
              type="radio" id="difficult-radio"
              name="diff" value="2"
              checked={this.state.diff === 2}
              onChange={this.setDiff}
            />
            <label htmlFor="difficult-radio">困难</label>
          </div>
          <div className="btngroup">
            <button onClick={() => {
              this.solve()
            }}>开始做题</button>
            <button onClick={() => {
              this.start()
            }}>重新开始</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
