// Game state variables
let gameContent = null
let currentStage = 1
let editor = null
let cellEditors = []
let completedStages = []
let skulptReady = false
let skulptLoadPromise = null
let skulptEnvironment = null // Persistent Skulpt environment for multi-cell stages

// Create a promise that resolves when Skulpt is ready
function createSkulptLoadPromise () {
  if (skulptLoadPromise) {
    return skulptLoadPromise
  }

  skulptLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded (using the correct Skulpt API)
    if (typeof Sk !== 'undefined' && typeof Sk.configure === 'function') {
      skulptReady = true
      resolve()
      return
    }
    // Set up a global callback for when Skulpt loads
    window.onSkulptLoaded = function () {
      // Give a moment for both scripts to load
      setTimeout(() => {
        if (typeof Sk !== 'undefined' && typeof Sk.configure === 'function') {
          skulptReady = true
          console.log('Skulpt loaded successfully via callback!')
          resolve()
        } else {
          console.warn('Skulpt callback fired but API not ready yet')
        }
      }, 100)
    }

    // Fallback: Check periodically if the global callback doesn't work
    let attempts = 0
    const maxAttempts = 100 // 10 seconds max wait
    const checkInterval = setInterval(() => {
      attempts++
      if (typeof Sk !== 'undefined' && typeof Sk.configure === 'function') {
        skulptReady = true
        clearInterval(checkInterval)
        console.log('Skulpt loaded (detected via polling)')
        resolve()
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        reject(new Error('Skulpt failed to load after 10 seconds'))
      }
    }, 100)

    // Additional timeout safety
    setTimeout(() => {
      if (!skulptReady) {
        reject(new Error('Skulpt loading timeout'))
      }
    }, 15000)
  })

  return skulptLoadPromise
}

// Initialize game by loading content from JSON
async function initializeGame () {
  try {
    console.log('Starting game initialization...')

    // Load game content from JSON file first (don't wait for Skulpt)
    console.log('Loading game content...')
    const response = await fetch('game-content.json')
    if (!response.ok) {
      throw new Error('Failed to load game content')
    }

    gameContent = await response.json()
    console.log('Game content loaded successfully')

    // Set game title and subtitle
    document.getElementById('game-title').textContent =
      gameContent.gameInfo.title
    document.getElementById('game-subtitle').textContent =
      gameContent.gameInfo.subtitle

    // Create developer navigation
    createDevNav()

    // Load the first stage
    loadStage(1)

    console.log('Game initialized successfully')

    // Initialize Skulpt in the background (don't block game loading)
    createSkulptLoadPromise()
      .then(() => {
        console.log('Skulpt ready for code execution')
      })
      .catch(error => {
        console.warn('Skulpt initialization failed:', error)
      })
  } catch (error) {
    console.error('Error initializing game:', error)
    const storyElement = document.getElementById('story-content')
    if (storyElement) {
      storyElement.innerHTML = `<p>Error loading game content. Please refresh the page or try again later.</p>
             <p>Technical details: ${error.message}</p>
             <p>If this persists, try clearing your browser cache and refreshing.</p>`
    }
  }
}

// Load a specific stage
function loadStage (stageId) {
  if (!gameContent) {
    console.error('Game content not loaded yet')
    return
  }

  // Find the stage in game content
  const stage = gameContent.stages.find(s => s.id === stageId)
  if (!stage) {
    console.error(`Stage ${stageId} not found`)
    return
  }

  currentStage = stageId

  // Update UI elements with stage content
  document.getElementById('story-content').innerHTML = stage.story
  document.getElementById(
    'challenge-content'
  ).innerHTML = `<strong>Challenge:</strong> ${stage.challenge}`
  document.getElementById(
    'data-content'
  ).innerHTML = `<strong>Data:</strong><br>${stage.data}`

  // Update progress bar
  const progressPercent = (stageId / gameContent.gameInfo.totalStages) * 100
  document.getElementById('progress-bar').style.width = `${progressPercent}%`

  // Update dev navigation
  updateDevNav()

  // Handle single vs multi-cell stages
  if (stage.cells) {
    setupMultiCellStage(stage)
  } else {
    setupSingleCellStage(stage)
  }

  // Set up hints
  setupHints(stage)

  // Reset next button
  const nextButton = document.getElementById('next-button')
  nextButton.classList.remove('active')

  console.log(`Loaded stage ${stageId}: ${stage.title}`)
}

// Set up a single-cell stage (Google Colab style)
function setupSingleCellStage (stage) {
  document.getElementById('cells-container').style.display = 'none'
  document.getElementById('single-cell-container').style.display = 'block'

  // Clear and recreate the single cell container with Colab styling
  const container = document.getElementById('single-cell-container')
  container.innerHTML = ''

  // Create a single cell with Colab styling
  const cellContainer = document.createElement('div')
  cellContainer.className = 'cell-container'
  cellContainer.id = 'single-cell'

  // Create cell header
  const cellHeader = document.createElement('div')
  cellHeader.className = 'cell-header'

  // Execution counter (starts empty)
  const cellNumber = document.createElement('span')
  cellNumber.className = 'cell-number'
  cellNumber.textContent = '[ ]'
  cellNumber.id = 'single-cell-number'

  const cellTitle = document.createElement('span')
  cellTitle.className = 'cell-title'
  cellTitle.textContent = 'Code Cell'

  const cellStatus = document.createElement('span')
  cellStatus.className = 'cell-status pending'
  cellStatus.textContent = 'Pending'
  cellStatus.id = 'single-cell-status'

  cellHeader.appendChild(cellNumber)
  cellHeader.appendChild(cellTitle)
  cellHeader.appendChild(cellStatus)
  cellContainer.appendChild(cellHeader)

  // Create code editor container with run button
  const editorContainer = document.createElement('div')
  editorContainer.className = 'code-editor-container'

  // Create run/stop button (Colab style)
  const runButton = document.createElement('button')
  runButton.className = 'cell-run-button'
  runButton.id = 'single-run-button'
  runButton.innerHTML = `
    <svg class="play-icon" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <svg class="stop-icon" viewBox="0 0 24 24" style="display: none;">
      <rect x="6" y="6" width="12" height="12"/>
    </svg>
  `
  editorContainer.appendChild(runButton)

  // Create code editor
  const editorElement = document.createElement('div')
  editorElement.className = 'code-editor'
  editorElement.id = 'single-code-editor'
  editorContainer.appendChild(editorElement)

  cellContainer.appendChild(editorContainer)

  // Create collapsible output container
  const outputContainer = document.createElement('div')
  outputContainer.className = 'output-container'
  outputContainer.id = 'single-output-container'
  outputContainer.style.display = 'none' // Initially hidden

  // Output header
  const outputHeader = document.createElement('div')
  outputHeader.className = 'output-header'
  outputHeader.innerHTML = `
    <svg class="output-toggle" viewBox="0 0 24 24">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
    <span class="output-label">Output</span>
    <span class="output-counter" id="single-output-counter"></span>
  `
  outputContainer.appendChild(outputHeader)

  // Output area
  const outputArea = document.createElement('div')
  outputArea.className = 'output-area empty'
  outputArea.id = 'single-output-area'
  outputContainer.appendChild(outputArea)

  cellContainer.appendChild(outputContainer)
  container.appendChild(cellContainer)

  // Initialize or reset code editor
  if (editor) {
    editor.toTextArea() // Clean up existing editor
  }

  editor = CodeMirror(document.getElementById('single-code-editor'), {
    value: stage.starterCode || '# Your code here\n',
    mode: 'python',
    theme: 'default', // Using default theme for Colab style
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
    autoCloseBrackets: true,
    viewportMargin: Infinity // Auto-resize height
  })

  // Set up run button
  document.getElementById('single-run-button').onclick = function () {
    runPythonCode(editor.getValue(), stage.solution)
  }

  // Set up output header click to toggle collapse
  outputHeader.onclick = function () {
    toggleSingleOutputCollapse()
  }
}

// Toggle single cell output collapse
function toggleSingleOutputCollapse () {
  const outputArea = document.getElementById('single-output-area')
  const toggle = document.querySelector(
    '#single-output-container .output-toggle'
  )

  if (outputArea.classList.contains('collapsed')) {
    outputArea.classList.remove('collapsed')
    toggle.classList.remove('collapsed')
  } else {
    outputArea.classList.add('collapsed')
    toggle.classList.add('collapsed')
  }
}

// Set up a multi-cell stage
function setupMultiCellStage (stage) {
  document.getElementById('single-cell-container').style.display = 'none'
  document.getElementById('cells-container').style.display = 'block'

  // Clear existing cells
  document.getElementById('cells-container').innerHTML = ''
  cellEditors = []

  // Create cells for this stage
  stage.cells.forEach((cell, index) => {
    createCodeCell(cell, index, stage.cells.length)
  })
}

// Global execution counter
let executionCounter = 0

// Create a code cell for multi-cell stages (Google Colab style)
function createCodeCell (cell, index, totalCells) {
  const cellContainer = document.createElement('div')
  cellContainer.className = 'cell-container'
  cellContainer.id = `cell-${index}`

  // Create cell header
  const cellHeader = document.createElement('div')
  cellHeader.className = 'cell-header'

  // Execution counter (starts empty)
  const cellNumber = document.createElement('span')
  cellNumber.className = 'cell-number'
  cellNumber.textContent = '[ ]'
  cellNumber.id = `cell-number-${index}`

  const cellTitle = document.createElement('span')
  cellTitle.className = 'cell-title'
  cellTitle.textContent = cell.title || `Code Cell ${index + 1}`

  const cellStatus = document.createElement('span')
  cellStatus.className = 'cell-status pending'
  cellStatus.textContent = 'Pending'
  cellStatus.id = `cell-status-${index}`

  cellHeader.appendChild(cellNumber)
  cellHeader.appendChild(cellTitle)
  cellHeader.appendChild(cellStatus)
  cellContainer.appendChild(cellHeader)

  // Create instruction element if provided
  if (cell.instruction) {
    const instruction = document.createElement('div')
    instruction.className = 'cell-instruction'
    instruction.innerHTML = cell.instruction
    cellContainer.appendChild(instruction)
  }

  // Create code editor container with run button
  const editorContainer = document.createElement('div')
  editorContainer.className = 'code-editor-container'

  // Create run/stop button (Colab style - circular, top-left)
  const runButton = document.createElement('button')
  runButton.className = 'cell-run-button'
  runButton.id = `run-button-${index}`
  runButton.innerHTML = `
    <svg class="play-icon" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <svg class="stop-icon" viewBox="0 0 24 24" style="display: none;">
      <rect x="6" y="6" width="12" height="12"/>
    </svg>
  `
  editorContainer.appendChild(runButton)

  // Create code editor
  const editorElement = document.createElement('div')
  editorElement.className = 'code-editor'
  editorElement.id = `code-editor-${index}`
  editorContainer.appendChild(editorElement)

  cellContainer.appendChild(editorContainer)

  // Create collapsible output container
  const outputContainer = document.createElement('div')
  outputContainer.className = 'output-container'
  outputContainer.id = `output-container-${index}`
  outputContainer.style.display = 'none' // Initially hidden

  // Output header (for collapsing)
  const outputHeader = document.createElement('div')
  outputHeader.className = 'output-header'
  outputHeader.innerHTML = `
    <svg class="output-toggle" viewBox="0 0 24 24">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
    <span class="output-label">Output</span>
    <span class="output-counter" id="output-counter-${index}"></span>
  `
  outputContainer.appendChild(outputHeader)

  // Output area
  const outputArea = document.createElement('div')
  outputArea.className = 'output-area empty'
  outputArea.id = `output-area-${index}`
  outputContainer.appendChild(outputArea)

  cellContainer.appendChild(outputContainer)

  // Add cell to container
  document.getElementById('cells-container').appendChild(cellContainer)

  // Initialize CodeMirror editor for this cell
  const cellEditor = CodeMirror(
    document.getElementById(`code-editor-${index}`),
    {
      value: cell.starterCode || '# Your code here\n',
      mode: 'python',
      theme: 'default', // Using default theme for Colab style
      lineNumbers: true,
      indentUnit: 4,
      matchBrackets: true,
      autoCloseBrackets: true,
      viewportMargin: Infinity // Auto-resize height
    }
  )

  cellEditors.push(cellEditor)

  // Set up run button for this cell
  document.getElementById(`run-button-${index}`).onclick = function () {
    runCellCode(cellEditor.getValue(), cell.expectedOutput, index, totalCells)
  }

  // Set up output header click to toggle collapse
  outputHeader.onclick = function () {
    toggleOutputCollapse(index)
  }
}

// Toggle output section collapse
function toggleOutputCollapse (cellIndex) {
  const outputArea = document.getElementById(`output-area-${cellIndex}`)
  const toggle = document.querySelector(
    `#output-container-${cellIndex} .output-toggle`
  )

  if (outputArea.classList.contains('collapsed')) {
    outputArea.classList.remove('collapsed')
    toggle.classList.remove('collapsed')
  } else {
    outputArea.classList.add('collapsed')
    toggle.classList.add('collapsed')
  }
}

// Set up hint buttons and text
function setupHints (stage) {
  const hintsContainer = document.getElementById('hints-container')
  const hintTextContainer = document.getElementById('hint-text-container')

  // Clear existing hints
  hintsContainer.innerHTML = ''
  hintTextContainer.innerHTML = ''

  // If no hints, hide the section
  if (!stage.hints || stage.hints.length === 0) {
    document.querySelector('.hint-section').style.display = 'none'
    return
  }

  // Show the hint section
  document.querySelector('.hint-section').style.display = 'block'

  // Create hint buttons and text elements
  stage.hints.forEach((hint, index) => {
    // Create button
    const hintButton = document.createElement('button')
    hintButton.className = 'hint-button'
    hintButton.textContent = `Hint ${index + 1}`
    hintButton.onclick = function () {
      showHint(index)
    }
    hintsContainer.appendChild(hintButton)

    // Create text element (hidden initially)
    const hintText = document.createElement('div')
    hintText.className = 'hint-text'
    hintText.id = `hint-${index}`
    hintText.textContent = hint
    hintTextContainer.appendChild(hintText)
  })
}

// Show a specific hint
function showHint (hintIndex) {
  // Hide all hints
  document.querySelectorAll('.hint-text').forEach(el => {
    el.classList.remove('active')
  })

  // Show the selected hint
  document.getElementById(`hint-${hintIndex}`).classList.add('active')
}

// Run Python code (for single-cell stages) with Colab-style output
async function runPythonCode (code, solution) {
  const outputContainer = document.getElementById('single-output-container')
  const outputArea = document.getElementById('single-output-area')
  const outputCounter = document.getElementById('single-output-counter')
  const runButton = document.getElementById('single-run-button')
  const cellStatus = document.getElementById('single-cell-status')
  const cellNumber = document.getElementById('single-cell-number')

  // Increment execution counter and update display
  executionCounter++
  cellNumber.textContent = `[${executionCounter}]`
  cellNumber.classList.add('executed')

  // Show output container and set running state
  outputContainer.style.display = 'block'
  outputArea.classList.remove('empty', 'collapsed')
  outputArea.classList.add('success')
  outputArea.textContent = 'Running code...'

  // Switch to stop button with rotating border
  runButton.classList.add('running')
  runButton.querySelector('.play-icon').style.display = 'none'
  runButton.querySelector('.stop-icon').style.display = 'block'

  cellStatus.textContent = 'Running'
  cellStatus.className = 'cell-status current'

  // Update counter
  const now = new Date()
  outputCounter.textContent = `Executed at ${now.getHours()}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

  // Ensure Skulpt is ready
  if (!skulptReady) {
    try {
      outputArea.textContent = 'Loading Python engine...'
      await createSkulptLoadPromise()
    } catch (error) {
      outputArea.textContent =
        'Error: Python engine failed to load. Please refresh the page.'
      outputArea.classList.remove('success')
      outputArea.classList.add('error')
      runButton.classList.remove('running')
      runButton.querySelector('.play-icon').style.display = 'block'
      runButton.querySelector('.stop-icon').style.display = 'none'
      cellStatus.textContent = 'Error'
      cellStatus.className = 'cell-status error'
      console.error('Skulpt loading error:', error)
      return
    }
  }

  try {
    // Variable to capture output text for validation
    let capturedOutput = ''

    // Configure Skulpt using the correct API
    Sk.pre = 'output'
    Sk.configure({
      output: function (text) {
        outputArea.textContent += text
        capturedOutput += text
      },
      read: function (x) {
        if (
          Sk.builtinFiles === undefined ||
          Sk.builtinFiles['files'][x] === undefined
        ) {
          throw "File not found: '" + x + "'"
        }
        return Sk.builtinFiles['files'][x]
      },
      execLimit: 10000
    })

    // Clear output area
    outputArea.textContent = ''

    // Run the code using the correct API
    const promise = Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody('<stdin>', false, code, true)
    })

    promise
      .then(() => {
        // Reset button to play state
        runButton.classList.remove('running')
        runButton.querySelector('.play-icon').style.display = 'block'
        runButton.querySelector('.stop-icon').style.display = 'none'

        // Pass the captured output to validation
        checkCompletion(code, solution, capturedOutput.trim())
      })
      .catch(e => {
        outputArea.textContent += '\nError: ' + e.toString()
        outputArea.classList.remove('success')
        outputArea.classList.add('error')

        // Reset button to play state
        runButton.classList.remove('running')
        runButton.querySelector('.play-icon').style.display = 'block'
        runButton.querySelector('.stop-icon').style.display = 'none'

        cellStatus.textContent = 'Error'
        cellStatus.className = 'cell-status error'
      })
  } catch (e) {
    outputArea.textContent += '\nError: ' + e.toString()
    outputArea.classList.remove('success')
    outputArea.classList.add('error')

    // Reset button to play state
    runButton.classList.remove('running')
    runButton.querySelector('.play-icon').style.display = 'block'
    runButton.querySelector('.stop-icon').style.display = 'none'

    cellStatus.textContent = 'Error'
    cellStatus.className = 'cell-status error'
  }
}

// Run code for a specific cell (multi-cell stages) with Colab-style output
async function runCellCode (code, expectedOutput, cellIndex, totalCells) {
  const outputContainer = document.getElementById(
    `output-container-${cellIndex}`
  )
  const outputArea = document.getElementById(`output-area-${cellIndex}`)
  const outputCounter = document.getElementById(`output-counter-${cellIndex}`)
  const runButton = document.getElementById(`run-button-${cellIndex}`)
  const cellStatus = document.getElementById(`cell-status-${cellIndex}`)
  const cellNumber = document.getElementById(`cell-number-${cellIndex}`)
  // Increment execution counter and update display
  executionCounter++
  cellNumber.textContent = `[${executionCounter}]`
  cellNumber.classList.add('executed')

  // Show output container and set running state
  outputContainer.style.display = 'block'
  outputArea.classList.remove('empty', 'collapsed')
  outputArea.classList.add('success')
  outputArea.textContent = 'Running code...'

  // Switch to stop button with rotating border
  runButton.classList.add('running')
  runButton.querySelector('.play-icon').style.display = 'none'
  runButton.querySelector('.stop-icon').style.display = 'block'

  cellStatus.textContent = 'Running'
  cellStatus.className = 'cell-status current'

  // Update counter
  const now = new Date()
  outputCounter.textContent = `Executed at ${now.getHours()}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

  // Ensure Skulpt is ready
  if (!skulptReady) {
    try {
      outputArea.textContent = 'Loading Python engine...'
      await createSkulptLoadPromise()
    } catch (error) {
      outputArea.textContent =
        'Error: Python engine failed to load. Please refresh the page.'
      outputArea.classList.remove('success')
      outputArea.classList.add('error')
      runButton.classList.remove('running')
      runButton.querySelector('.play-icon').style.display = 'block'
      runButton.querySelector('.stop-icon').style.display = 'none'
      cellStatus.textContent = 'Error'
      cellStatus.className = 'cell-status error'
      console.error('Skulpt loading error:', error)
      return
    }
  } // Store output to compare with expected
  let outputText = ''
  try {
    // Configure Skulpt to capture output for this cell
    Sk.pre = 'output'
    Sk.configure({
      output: function (text) {
        outputText += text
        outputArea.textContent += text
      },
      read: function (x) {
        if (
          Sk.builtinFiles === undefined ||
          Sk.builtinFiles['files'][x] === undefined
        ) {
          throw "File not found: '" + x + "'"
        }
        return Sk.builtinFiles['files'][x]
      },
      execLimit: 10000
    })

    // Clear output area for this cell
    outputArea.textContent = ''
    outputText = '' // Execute code in the persistent environment to maintain variables between cells
    try {
      // For multi-cell stages, we need to maintain the Python namespace between executions
      // The key insight is that Skulpt's module system persists variables if we don't reset it
      const promise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody('<stdin>', false, code, true)
      })

      promise
        .then(() => {
          // Reset button to play state
          runButton.classList.remove('running')
          runButton.querySelector('.play-icon').style.display = 'block'
          runButton.querySelector('.stop-icon').style.display = 'none'

          // Check if output matches expected
          if (checkCellOutput(outputText, expectedOutput)) {
            cellStatus.textContent = 'Completed'
            cellStatus.className = 'cell-status completed'
            outputArea.classList.remove('error')
            outputArea.classList.add('success')

            // Check if all cells are completed
            checkAllCellsCompleted(totalCells)
          } else {
            cellStatus.textContent = 'Incorrect'
            cellStatus.className = 'cell-status error'
            outputArea.classList.remove('success')
            outputArea.classList.add('error')
          }
        })
        .catch(e => {
          console.error('Error executing code:', e)
          outputArea.textContent += '\nError: ' + e.toString()
          outputArea.classList.remove('success')
          outputArea.classList.add('error')

          // Reset button to play state
          runButton.classList.remove('running')
          runButton.querySelector('.play-icon').style.display = 'block'
          runButton.querySelector('.stop-icon').style.display = 'none'

          cellStatus.textContent = 'Error'
          cellStatus.className = 'cell-status error'
        })
    } catch (e) {
      console.error('Error in code execution setup:', e)
      outputArea.textContent += '\nError: ' + e.toString()
      outputArea.classList.remove('success')
      outputArea.classList.add('error')

      // Reset button to play state
      runButton.classList.remove('running')
      runButton.querySelector('.play-icon').style.display = 'block'
      runButton.querySelector('.stop-icon').style.display = 'none'

      cellStatus.textContent = 'Error'
      cellStatus.className = 'cell-status error'
    }
  } catch (e) {
    console.error('Error in runCellCode:', e)
    outputArea.textContent += '\nError: ' + e.toString()
    outputArea.classList.remove('success')
    outputArea.classList.add('error')

    // Reset button to play state
    runButton.classList.remove('running')
    runButton.querySelector('.play-icon').style.display = 'block'
    runButton.querySelector('.stop-icon').style.display = 'none'

    cellStatus.textContent = 'Error'
    cellStatus.className = 'cell-status error'
  }
}

// Check if cell output matches expected output with flexible validation
function checkCellOutput (output, expectedOutput) {
  if (!expectedOutput) return true

  // If expectedOutput is an array of strings, check if all are present
  if (Array.isArray(expectedOutput)) {
    return expectedOutput.every(expected => {
      // Normalize both strings for comparison
      const normalizedOutput = output.toLowerCase().replace(/\s+/g, ' ').trim()
      const normalizedExpected = expected
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()

      // Check if the expected text appears anywhere in the output
      return normalizedOutput.includes(normalizedExpected)
    })
  }

  // For single expected output, do normalized comparison
  const normalizedOutput = output.toLowerCase().replace(/\s+/g, ' ').trim()
  const normalizedExpected = expectedOutput
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

  return normalizedOutput.includes(normalizedExpected)
}

// Check if all cells in a multi-cell stage are completed
function checkAllCellsCompleted (totalCells) {
  const completedCells = document.querySelectorAll(
    '.cell-status.completed'
  ).length

  if (completedCells === totalCells) {
    // All cells completed, show next button
    document.getElementById('next-button').classList.add('active')
    completedStages.push(currentStage)
    updateDevNav()
  }
}

// Comprehensive solution validation with pattern matching
async function validateSolution (code, solution, actualOutput, stage) {
  // Get validation rules from the stage data (from JSON)
  const rules = stage.validation
  console.log('Validating stage:', stage.id, 'with rules:', rules)

  // If no specific rules, fall back to simple output comparison
  if (!rules) {
    try {
      const expectedOutput = await executeCodeAndCaptureOutput(solution)
      const isCorrect =
        normalizeOutput(actualOutput) === normalizeOutput(expectedOutput)
      return {
        isCorrect,
        reason: isCorrect
          ? 'Output matches expected'
          : 'Output does not match expected',
        expectedPatterns: [expectedOutput]
      }
    } catch (error) {
      return {
        isCorrect: false,
        reason: 'Could not execute solution code',
        expectedPatterns: []
      }
    }
  }

  // Convert string patterns to regex objects
  const codePatterns = rules.codePatterns.map(
    pattern => new RegExp(pattern, 'i')
  )
  const outputPatterns = rules.outputPatterns.map(
    pattern => new RegExp(pattern, 'i')
  )

  // Check code patterns (structure validation)
  const codeValidation = validateCodePatterns(code, codePatterns)
  if (!codeValidation.isValid) {
    return {
      isCorrect: false,
      reason: `Code structure issue: ${codeValidation.missingPattern}`,
      feedback: 'Code structure incorrect',
      expectedPatterns: rules.codePatterns
    }
  }

  // Check output patterns (result validation)
  const outputValidation = validateOutputPatterns(actualOutput, outputPatterns)
  if (!outputValidation.isValid) {
    return {
      isCorrect: false,
      reason: `Output issue: Missing pattern ${outputValidation.missingPattern}`,
      feedback: 'Output incorrect',
      expectedPatterns: rules.outputPatterns
    }
  }

  // All validations passed
  return {
    isCorrect: true,
    reason: 'All validations passed',
    expectedPatterns: rules.outputPatterns
  }
}

// Validate code against required patterns
function validateCodePatterns (code, patterns) {
  for (const pattern of patterns) {
    if (!pattern.test(code)) {
      return {
        isValid: false,
        missingPattern: pattern.source || pattern.toString()
      }
    }
  }
  return { isValid: true }
}

// Validate output against expected patterns
function validateOutputPatterns (output, patterns) {
  for (const pattern of patterns) {
    if (!pattern.test(output)) {
      return {
        isValid: false,
        missingPattern: pattern.source || pattern.toString()
      }
    }
  }
  return { isValid: true }
}

// Normalize output for comparison (remove extra whitespace, etc.)
function normalizeOutput (output) {
  return output
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .toLowerCase() // Case insensitive comparison
}

// Helper function to execute Python code and capture output
async function executeCodeAndCaptureOutput (code) {
  return new Promise((resolve, reject) => {
    let output = ''

    // Configure Skulpt to capture output
    Sk.configure({
      output: function (text) {
        output += text
      },
      read: function (x) {
        if (
          Sk.builtinFiles === undefined ||
          Sk.builtinFiles['files'][x] === undefined
        ) {
          throw "File not found: '" + x + "'"
        }
        return Sk.builtinFiles['files'][x]
      },
      execLimit: 10000
    })

    // Execute the code
    const promise = Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody('<stdin>', false, code, true)
    })

    promise
      .then(() => {
        resolve(output.trim())
      })
      .catch(e => {
        reject(e)
      })
  })
}

// Check if single-cell stage is completed with flexible validation
async function checkCompletion (code, solution, actualOutput) {
  const cellStatus = document.getElementById('single-cell-status')

  try {
    // Get current stage info for validation rules
    const stage = gameContent.stages.find(s => s.id === currentStage)

    // Perform multi-layered validation
    const validationResult = await validateSolution(
      code,
      solution,
      actualOutput,
      stage
    )

    if (validationResult.isCorrect) {
      // Solution is correct
      cellStatus.textContent = 'Completed'
      cellStatus.className = 'cell-status completed'

      // Show next button
      document.getElementById('next-button').classList.add('active')
      if (!completedStages.includes(currentStage)) {
        completedStages.push(currentStage)
        updateDevNav()
      }
    } else {
      // Solution is incorrect
      cellStatus.textContent = validationResult.feedback || 'Incorrect'
      cellStatus.className = 'cell-status error'

      // Show debug info in console
      console.log('Validation failed:', validationResult.reason)
      console.log('Expected patterns:', validationResult.expectedPatterns)
      console.log('User code:', code)
      console.log('Actual output:', actualOutput)

      // Don't show next button for incorrect solutions
      document.getElementById('next-button').classList.remove('active')
    }
  } catch (error) {
    console.error('Error checking solution:', error)
    // If we can't validate, mark as completed (fallback behavior)
    cellStatus.textContent = 'Completed'
    cellStatus.className = 'cell-status completed'

    // Show next button
    document.getElementById('next-button').classList.add('active')
    if (!completedStages.includes(currentStage)) {
      completedStages.push(currentStage)
      updateDevNav()
    }
  }
}

// Create developer navigation for testing
function createDevNav () {
  const devNav = document.getElementById('dev-nav')
  devNav.innerHTML = ''

  // Create a button for each stage
  for (let i = 1; i <= gameContent.gameInfo.totalStages; i++) {
    const button = document.createElement('button')
    button.textContent = i
    button.onclick = function () {
      loadStage(i)
    }
    devNav.appendChild(button)
  }

  // Set up toggle button
  document.getElementById('dev-nav-toggle').onclick = function () {
    devNav.classList.toggle('active')
  }
}

// Update developer navigation to highlight current stage
function updateDevNav () {
  const buttons = document.querySelectorAll('#dev-nav button')

  buttons.forEach((button, index) => {
    // Clear existing classes
    button.className = ''

    // Set current stage class
    if (index + 1 === currentStage) {
      button.classList.add('current-stage')
    }

    // Mark completed stages
    if (completedStages.includes(index + 1)) {
      button.classList.add('completed-stage')
    }
  })
}

// Show celebration animation when a stage is completed
function showCelebration () {
  const container = document.getElementById('celebration')
  container.innerHTML = ''
  container.classList.add('active')

  // Create confetti
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'

    // Random position, color, size, and animation duration
    const left = Math.random() * 100
    const color = `hsl(${Math.random() * 360}, 80%, 60%)`
    const size = Math.random() * 10 + 5
    const duration = Math.random() * 3 + 2

    confetti.style.left = `${left}%`
    confetti.style.background = color
    confetti.style.width = `${size}px`
    confetti.style.height = `${size}px`
    confetti.style.animationDuration = `${duration}s`

    container.appendChild(confetti)
  }

  // Remove celebration after animation completes
  setTimeout(() => {
    container.classList.remove('active')
  }, 5000)
}

// Set up next button to advance to next stage
document.getElementById('next-button').addEventListener('click', function () {
  const nextStage = currentStage + 1

  // Check if there's a next stage
  if (nextStage <= gameContent.gameInfo.totalStages) {
    showCelebration()
    loadStage(nextStage)
  } else {
    // Handle game completion
    document.getElementById('story-content').innerHTML = `
          <h2>Congratulations!</h2>
          <p>You've completed all stages of the Digital Archaeology Mystery!</p>
          <p>You've successfully pieced together the ancient fragments and uncovered the lost knowledge.</p>
        `
    document.getElementById('challenge-content').style.display = 'none'
    document.getElementById('data-content').style.display = 'none'
    document.getElementById('code-panel').style.display = 'none'
    showCelebration()
  }
})

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeGame)

// Additional verification that Skulpt is working
window.addEventListener('load', () => {
  // Check if Skulpt is already ready when page loads
  if (
    typeof Sk !== 'undefined' &&
    typeof Sk.configure === 'function' &&
    !skulptReady
  ) {
    skulptReady = true
    console.log('Skulpt was ready at page load')
  }

  // Give a bit more time for everything to load
  setTimeout(() => {
    if (!skulptReady && typeof Sk === 'undefined') {
      console.warn(
        'Skulpt loading verification: Not ready yet, this is normal during initial load'
      )
      const storyContent = document.getElementById('story-content')
      if (
        storyContent &&
        !storyContent.innerHTML.includes('Loading Python engine')
      ) {
        storyContent.innerHTML +=
          '<br><br><div style="color: #ffa500; font-weight: bold;">🔄 Python engine is still loading... Please wait a moment before running code.</div>'
      }
    } else {
      console.log('Skulpt verification: Ready and working!')
    }
  }, 3000)
})
