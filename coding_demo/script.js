// Game state variables
let gameContent = null
let currentStage = 1
let editor = null
let cellEditors = []
let completedStages = []
let skulptReady = false
let skulptLoadPromise = null
let skulptEnvironment = null // Persistent Skulpt environment for multi-cell stages
let successfulCellExecutions = {} // Track which cells have executed successfully by stage

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
    createDevNav() // Load the first stage
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

    // Initialize LLM integration
    console.log('Initializing LLM integration...')
    ollamaLLM = new OllamaLLMIntegration()
    console.log('LLM integration initialized')
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
  // Update UI elements with stage content (convert \n to <br> for proper line breaks)
  document.getElementById('story-content').innerHTML = stage.story.replace(
    /\n/g,
    '<br>'
  )
  document.getElementById(
    'challenge-content'
  ).innerHTML = `<strong>Challenge:</strong> ${stage.challenge.replace(
    /\n/g,
    '<br>'
  )}`
  document.getElementById(
    'data-content'
  ).innerHTML = `<strong>Data:</strong><br>${stage.data.replace(/\n/g, '<br>')}`

  // Update progress bar
  const progressPercent = (stageId / gameContent.gameInfo.totalStages) * 100
  document.getElementById('progress-bar').style.width = `${progressPercent}%`

  // Update dev navigation
  updateDevNav()
  // Handle single vs multi-cell stages
  if (stage.cells) {
    setupMultiCellStage(stage)
    // Initialize successful execution tracking for this stage
    successfulCellExecutions[stageId] = new Set()
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
  // Execution counter (starts empty) with embedded play/stop icons
  const cellNumber = document.createElement('span')
  cellNumber.className = 'cell-number'
  cellNumber.id = 'single-cell-number'
  cellNumber.innerHTML = `
    [ ]
    <svg class="play-icon" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <svg class="stop-icon" viewBox="0 0 24 24" style="display: none;">
      <rect x="6" y="6" width="12" height="12"/>
    </svg>
  `

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
  // Create code editor container
  const editorContainer = document.createElement('div')
  editorContainer.className = 'code-editor-container'

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
    try {
      editor.toTextArea() // Clean up existing editor
    } catch (e) {
      console.log(
        'Editor cleanup error (expected when switching stage types):',
        e
      )
    }
    editor = null
  }
  editor = CodeMirror(document.getElementById('single-code-editor'), {
    value: stage.starterCode || '# Your code here\n',
    mode: 'python',
    theme: 'default', // Using default theme for Colab style
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
    autoCloseBrackets: true,
    viewportMargin: Infinity, // Auto-resize height
    extraKeys: {
      'Ctrl-Enter': function () {
        runPythonCode(editor.getValue(), stage.solution)
      }
    }
  })

  // Set up cell number click to run code (replacing separate run button)
  cellNumber.onclick = function () {
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

  // Clean up existing single-cell editor if it exists
  if (editor) {
    try {
      editor.toTextArea()
    } catch (e) {
      console.log(
        'Editor cleanup error (expected when switching stage types):',
        e
      )
    }
    editor = null
  }

  // Clean up existing cell editors
  if (cellEditors.length > 0) {
    cellEditors.forEach(cellEditor => {
      try {
        if (cellEditor && cellEditor.toTextArea) {
          cellEditor.toTextArea()
        }
      } catch (e) {
        console.log('Cell editor cleanup error:', e)
      }
    })
  }

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
  // Execution counter (starts empty) with embedded play/stop icons
  const cellNumber = document.createElement('span')
  cellNumber.className = 'cell-number'
  cellNumber.textContent = '[ ]'
  cellNumber.id = `cell-number-${index}`

  // Add play and stop icons
  cellNumber.innerHTML = `
    [ ]
    <svg class="play-icon" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <svg class="stop-icon" viewBox="0 0 24 24" style="display: none;">
      <rect x="6" y="6" width="12" height="12"/>
    </svg>
  `

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
  // Create code editor container
  const editorContainer = document.createElement('div')
  editorContainer.className = 'code-editor-container'

  // Create execution indicator (top-right corner)
  const executionIndicator = document.createElement('div')
  executionIndicator.className = 'cell-execution-indicator'
  executionIndicator.id = `execution-indicator-${index}`
  executionIndicator.style.display = 'none' // Initially hidden
  editorContainer.appendChild(executionIndicator)

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
      viewportMargin: Infinity, // Auto-resize height
      extraKeys: {
        'Ctrl-Enter': function () {
          runCellCode(
            cellEditor.getValue(),
            cell.expectedOutput,
            index,
            totalCells
          )
        }
      }
    }
  )
  cellEditors.push(cellEditor)

  // Set up cell number click to run code (replacing separate run button)
  cellNumber.onclick = function () {
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

// Update visual indicators for successful cell execution tracking
function updateCellExecutionIndicators () {
  const successfulCells = successfulCellExecutions[currentStage] || new Set()

  // Update all cell containers to show execution status
  document
    .querySelectorAll('.cell-container')
    .forEach((cellContainer, index) => {
      const executionIndicator = cellContainer.querySelector(
        `#execution-indicator-${index}`
      )

      if (!executionIndicator) return

      if (successfulCells.has(index)) {
        // Cell executed successfully
        executionIndicator.style.display = 'block'
        executionIndicator.textContent = '✓ OK'
        executionIndicator.className =
          'cell-execution-indicator successfully-executed'
        cellContainer.classList.add('successfully-executed')
        cellContainer.classList.remove('execution-failed')
      } else {
        // Check if cell has been executed but failed
        const cellStatus = cellContainer.querySelector('.cell-status')
        if (cellStatus && cellStatus.classList.contains('error')) {
          executionIndicator.style.display = 'block'
          executionIndicator.textContent = '✗ ERR'
          executionIndicator.className =
            'cell-execution-indicator execution-failed'
          cellContainer.classList.add('execution-failed')
          cellContainer.classList.remove('successfully-executed')
        } else {
          // Cell not executed or no status yet
          executionIndicator.style.display = 'none'
          cellContainer.classList.remove(
            'successfully-executed',
            'execution-failed'
          )
        }
      }
    })

  console.log(
    'Updated execution indicators. Successful cells:',
    Array.from(successfulCells)
  )
}

// Set up hint buttons and text
function setupHints (stage) {
  const hintsContainer = document.getElementById('hints-container')
  const hintTextContainer = document.getElementById('hint-text-container')

  // Clear existing hints
  hintsContainer.innerHTML = ''
  hintTextContainer.innerHTML = ''

  // Check if LLM mode is enabled
  if (ollamaLLM && ollamaLLM.isEnabled) {
    // LLM mode - show query buttons instead of traditional hints
    ollamaLLM.updateHintSystem()
    document.querySelector('.hint-section').style.display = 'block'
    return
  }

  // Traditional hint mode
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
  const cellStatus = document.getElementById('single-cell-status')
  const cellNumber = document.getElementById('single-cell-number')

  // Increment execution counter and update display
  executionCounter++
  cellNumber.innerHTML = `
    [${executionCounter}]
    <svg class="play-icon" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <svg class="stop-icon" viewBox="0 0 24 24" style="display: none;">
      <rect x="6" y="6" width="12" height="12"/>
    </svg>
  `
  cellNumber.classList.add('executed')

  // Show output container and set running state
  outputContainer.style.display = 'block'
  outputArea.classList.remove('empty', 'collapsed')
  outputArea.classList.add('success')
  outputArea.textContent = 'Running code...'

  // Switch to running state with rotating border
  cellNumber.classList.add('running')

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
      cellNumber.classList.remove('running')
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
    outputArea.textContent = '' // Run the code using the correct API
    const promise = Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody('<stdin>', false, code, true)
    })

    promise
      .then(() => {
        // Reset cell number to normal state
        cellNumber.classList.remove('running')

        // Pass the captured output to validation
        checkCompletion(code, solution, capturedOutput.trim())
      })
      .catch(e => {
        outputArea.textContent += '\nError: ' + e.toString()
        outputArea.classList.remove('success')
        outputArea.classList.add('error')

        // Reset cell number to normal state
        cellNumber.classList.remove('running')

        cellStatus.textContent = 'Error'
        cellStatus.className = 'cell-status error'
      })
  } catch (e) {
    outputArea.textContent += '\nError: ' + e.toString()
    outputArea.classList.remove('success')
    outputArea.classList.add('error')

    // Reset cell number to normal state
    cellNumber.classList.remove('running')

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
  const cellStatus = document.getElementById(`cell-status-${cellIndex}`)
  const cellNumber = document.getElementById(`cell-number-${cellIndex}`)

  // Increment execution counter and update display
  executionCounter++
  cellNumber.innerHTML = `
    [${executionCounter}]
    <svg class="play-icon" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <svg class="stop-icon" viewBox="0 0 24 24" style="display: none;">
      <rect x="6" y="6" width="12" height="12"/>
    </svg>
  `
  cellNumber.classList.add('executed')

  // Show output container and set running state
  outputContainer.style.display = 'block'
  outputArea.classList.remove('empty', 'collapsed')
  outputArea.classList.add('success')
  outputArea.textContent = 'Running code...'

  // Switch to running state with rotating border
  cellNumber.classList.add('running')

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
      cellNumber.classList.remove('running')
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
    }) // Clear output area for this cell
    outputArea.textContent = ''
    outputText = '' // Execute code in the persistent environment to maintain variables between cells
    try {
      // For multi-cell stages, we need to maintain the Python namespace between executions
      // Build accumulated code from successfully executed cells plus the current cell
      let accumulatedCode = ''

      // Get current stage to access all cells
      const stage = gameContent.stages.find(s => s.id === currentStage)
      if (stage && stage.cells) {
        // Add code from all successfully executed cells first
        const successfulCells =
          successfulCellExecutions[currentStage] || new Set()
        for (let i = 0; i < cellIndex; i++) {
          if (successfulCells.has(i)) {
            const cellCode = cellEditors[i].getValue()
            if (cellCode.trim()) {
              accumulatedCode += cellCode + '\n'
            }
          }
        }

        // Add the current cell's code (always include it for execution)
        const currentCellCode = cellEditors[cellIndex].getValue()
        if (currentCellCode.trim()) {
          accumulatedCode += currentCellCode + '\n'
        }
      } // Execute the accumulated code to maintain variable persistence
      console.log(`Cell ${cellIndex}: Executing accumulated code`)
      console.log(
        'Successful cells included:',
        Array.from(successfulCellExecutions[currentStage] || [])
      )
      console.log('Current cell being executed:', cellIndex)
      console.log('Accumulated code:', accumulatedCode)
      const promise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody('<stdin>', false, accumulatedCode, true)
      })

      promise
        .then(() => {
          // Execution was successful - mark this cell as successfully executed
          if (!successfulCellExecutions[currentStage]) {
            successfulCellExecutions[currentStage] = new Set()
          }
          successfulCellExecutions[currentStage].add(cellIndex)

          // Reset cell number to normal state
          cellNumber.classList.remove('running')

          // Get cell data for enhanced validation
          const stage = gameContent.stages.find(s => s.id === currentStage)
          const cellData = stage && stage.cells ? stage.cells[cellIndex] : null

          // Check if output matches expected with enhanced validation
          if (checkCellOutput(outputText, expectedOutput, cellData)) {
            cellStatus.textContent = 'Completed'
            cellStatus.className = 'cell-status completed'
            outputArea.classList.remove('error')
            outputArea.classList.add('success') // Check if all cells are completed
            checkAllCellsCompleted(totalCells)

            // Update visual indicators
            updateCellExecutionIndicators()
          } else {
            // Validation failed - remove this cell from successful executions
            if (successfulCellExecutions[currentStage]) {
              successfulCellExecutions[currentStage].delete(cellIndex)
            }

            // Provide specific, helpful error feedback
            const specificFeedback = generateSpecificCellFeedback(
              outputText,
              expectedOutput,
              cellData,
              cellIndex
            )
            cellStatus.textContent = specificFeedback.statusText
            cellStatus.className = 'cell-status error'
            outputArea.classList.remove('success')
            outputArea.classList.add('error')

            // Add helpful feedback to the output area
            const feedbackDiv = document.createElement('div')
            feedbackDiv.className = 'cell-feedback'
            feedbackDiv.innerHTML = specificFeedback.detailedMessage
            outputArea.appendChild(feedbackDiv)

            // Automatically show relevant hints if validation fails
            if (specificFeedback.suggestedHints.length > 0) {
              showSpecificHints(specificFeedback.suggestedHints)
            }

            // Enhanced feedback for debugging
            console.log('Cell validation failed:')
            console.log('Expected:', expectedOutput)
            console.log('Actual output:', outputText)
            console.log('Cell data:', cellData)
            console.log('Feedback:', specificFeedback)

            // Update visual indicators
            updateCellExecutionIndicators()
          }
        })
        .catch(e => {
          // Execution failed - remove this cell from successful executions if it was there
          if (successfulCellExecutions[currentStage]) {
            successfulCellExecutions[currentStage].delete(cellIndex)
          }
          console.error('Error executing code:', e)
          outputArea.textContent += '\nError: ' + e.toString()
          outputArea.classList.remove('success')
          outputArea.classList.add('error')

          // Reset cell number to normal state
          cellNumber.classList.remove('running')

          cellStatus.textContent = 'Error'
          cellStatus.className = 'cell-status error'

          // Update visual indicators
          updateCellExecutionIndicators()
        })
    } catch (e) {
      console.error('Error in code execution setup:', e)
      outputArea.textContent += '\nError: ' + e.toString()
      outputArea.classList.remove('success')
      outputArea.classList.add('error')

      // Reset cell number to normal state
      cellNumber.classList.remove('running')

      cellStatus.textContent = 'Error'
      cellStatus.className = 'cell-status error'
    }
  } catch (e) {
    console.error('Error in runCellCode:', e)
    outputArea.textContent += '\nError: ' + e.toString()
    outputArea.classList.remove('success')
    outputArea.classList.add('error')

    // Reset cell number to normal state
    cellNumber.classList.remove('running')

    cellStatus.textContent = 'Error'
    cellStatus.className = 'cell-status error'
  }
}

// Check if cell output matches expected output with flexible validation
function checkCellOutput (output, expectedOutput, cellData = null) {
  if (!expectedOutput) return true

  // Enhanced validation for multi-cell stages with cell-specific validation
  if (cellData && cellData.validation) {
    return validateCellWithPatterns(output, cellData.validation)
  }

  // If expectedOutput is an array of strings, check if all are present with flexible matching
  if (Array.isArray(expectedOutput)) {
    return expectedOutput.every(expected => {
      return flexibleOutputMatch(output, expected)
    })
  }

  // For single expected output, do flexible comparison
  return flexibleOutputMatch(output, expectedOutput)
}

// Flexible output matching with multiple strategies
function flexibleOutputMatch (output, expected) {
  const normalizedOutput = output.toLowerCase().replace(/\s+/g, ' ').trim()
  const normalizedExpected = expected.toLowerCase().replace(/\s+/g, ' ').trim()

  // Strategy 1: Direct substring match
  if (normalizedOutput.includes(normalizedExpected)) {
    return true
  }

  // Strategy 2: Extract numbers and key words for numeric comparisons
  const outputNumbers = extractNumbers(output)
  const expectedNumbers = extractNumbers(expected)

  if (expectedNumbers.length > 0 && outputNumbers.length > 0) {
    // Check if expected numbers appear in output
    const hasAllNumbers = expectedNumbers.every(num =>
      outputNumbers.some(outNum => Math.abs(outNum - num) < 0.001)
    )

    if (hasAllNumbers) {
      // Also check for key contextual words
      const expectedWords = normalizedExpected
        .split(/\s+/)
        .filter(word => word.length > 3 && !isNumber(word))
      const hasContextWords =
        expectedWords.length === 0 ||
        expectedWords.some(word => normalizedOutput.includes(word))

      return hasContextWords
    }
  }

  // Strategy 3: Pattern-based matching for common output formats
  return patternBasedMatch(normalizedOutput, normalizedExpected)
}

// Extract numbers from text
function extractNumbers (text) {
  const matches = text.match(/\d+\.?\d*/g)
  return matches ? matches.map(Number) : []
}

// Check if string represents a number
function isNumber (str) {
  return !isNaN(parseFloat(str)) && isFinite(str)
}

// Pattern-based matching for common output patterns
function patternBasedMatch (output, expected) {
  // Handle common patterns like "X: Y" or "X = Y"
  const expectedPattern = expected
    .replace(/\d+/g, '\\d+')
    .replace(/:/g, '\\s*:\\s*')
  try {
    const regex = new RegExp(expectedPattern, 'i')
    return regex.test(output)
  } catch (e) {
    return false
  }
}

// Validate cell output using pattern-based validation rules
function validateCellWithPatterns (output, validation) {
  if (!validation) return true

  const normalizedOutput = output.toLowerCase().replace(/\s+/g, ' ').trim()

  // Check required output patterns
  if (validation.outputPatterns) {
    const patterns = validation.outputPatterns.map(p => new RegExp(p, 'i'))
    const passed = patterns.every(pattern => pattern.test(normalizedOutput))
    if (!passed) return false
  }

  // Check required numbers in output
  if (validation.requiredNumbers) {
    const outputNumbers = extractNumbers(output)
    const hasAllNumbers = validation.requiredNumbers.every(num =>
      outputNumbers.some(outNum => Math.abs(outNum - num) < 0.001)
    )
    if (!hasAllNumbers) return false
  }

  // Check required text phrases
  if (validation.requiredText) {
    const hasAllText = validation.requiredText.every(text =>
      normalizedOutput.includes(text.toLowerCase())
    )
    if (!hasAllText) return false
  }

  return true
}

// Generate specific feedback for cell validation failures
function generateSpecificCellFeedback (
  actualOutput,
  expectedOutput,
  cellData,
  cellIndex
) {
  const feedback = {
    statusText: 'Validation Failed',
    detailedMessage: '',
    suggestedHints: []
  }

  // Get current stage for context
  const stage = gameContent.stages.find(s => s.id === currentStage)
  const availableHints = stage ? stage.hints || [] : []

  // Analyze the type of validation failure
  if (!actualOutput || actualOutput.trim() === '') {
    feedback.statusText = 'No Output'
    feedback.detailedMessage = `
      <strong>🚫 No output detected</strong><br>
      Your code ran but didn't produce any output. Make sure to:
      <ul>
        <li>Use <code>print()</code> statements to display results</li>
        <li>Check that your code is properly indented</li>
        <li>Verify your code actually executes the calculation</li>
      </ul>
    `
    // Suggest hints related to printing or basic syntax
    feedback.suggestedHints = availableHints.slice(0, 1) // First hint usually covers basics
  } else if (cellData && cellData.validation) {
    // Cell has specific validation rules - analyze what failed
    const validation = cellData.validation

    if (validation.requiredNumbers) {
      const actualNumbers = extractNumbers(actualOutput)
      const missingNumbers = validation.requiredNumbers.filter(
        num =>
          !actualNumbers.some(actualNum => Math.abs(actualNum - num) < 0.001)
      )

      if (missingNumbers.length > 0) {
        feedback.statusText = 'Wrong Numbers'
        feedback.detailedMessage = `
          <strong>🔢 Calculation error detected</strong><br>
          Expected numbers: <code>${validation.requiredNumbers.join(
            ', '
          )}</code><br>
          Your output contains: <code>${actualNumbers.join(', ')}</code><br>
          Missing: <code>${missingNumbers.join(', ')}</code><br>
          <em>Double-check your mathematical calculations and variable assignments.</em>
        `
        // Suggest calculation-related hints
        feedback.suggestedHints = availableHints
          .filter(
            hint =>
              hint.toLowerCase().includes('calculat') ||
              hint.toLowerCase().includes('math') ||
              hint.toLowerCase().includes('number')
          )
          .slice(0, 2)
      }
    }

    if (validation.requiredText) {
      const normalizedOutput = actualOutput.toLowerCase()
      const missingText = validation.requiredText.filter(
        text => !normalizedOutput.includes(text.toLowerCase())
      )

      if (missingText.length > 0) {
        feedback.statusText = 'Missing Text'
        feedback.detailedMessage = `
          <strong>📝 Output format issue</strong><br>
          Missing required text: <code>${missingText.join(', ')}</code><br>
          <em>Check that your print statements include all the required labels and formatting.</em>
        `
        // Suggest formatting-related hints
        feedback.suggestedHints = availableHints
          .filter(
            hint =>
              hint.toLowerCase().includes('format') ||
              hint.toLowerCase().includes('print') ||
              hint.toLowerCase().includes('output')
          )
          .slice(0, 2)
      }
    }

    if (validation.outputPatterns) {
      const failedPatterns = validation.outputPatterns.filter(
        pattern => !new RegExp(pattern, 'i').test(actualOutput)
      )

      if (failedPatterns.length > 0) {
        feedback.statusText = 'Pattern Mismatch'
        feedback.detailedMessage = `
          <strong>📋 Output pattern doesn't match</strong><br>
          Your output format doesn't match the expected pattern.<br>
          <em>Review the instruction carefully and check your output format.</em>
        `
        // Suggest format-related hints
        feedback.suggestedHints = availableHints
          .filter(
            hint =>
              hint.toLowerCase().includes('format') ||
              hint.toLowerCase().includes('structure')
          )
          .slice(0, 2)
      }
    }
  } else if (Array.isArray(expectedOutput)) {
    // Multiple expected outputs - check which are missing
    const missingOutputs = expectedOutput.filter(
      expected => !flexibleOutputMatch(actualOutput, expected)
    )

    if (missingOutputs.length > 0) {
      feedback.statusText = 'Incomplete Output'
      feedback.detailedMessage = `
        <strong>📋 Incomplete results</strong><br>
        Missing expected outputs:
        <ul>
          ${missingOutputs
            .map(output => `<li><code>${output}</code></li>`)
            .join('')}
        </ul>
        <em>Make sure your code produces all the required output lines.</em>
      `
      // Suggest comprehensive hints
      feedback.suggestedHints = availableHints.slice(0, 2)
    }
  } else {
    // Single expected output doesn't match
    feedback.statusText = 'Output Mismatch'
    feedback.detailedMessage = `
      <strong>🎯 Output doesn't match expected result</strong><br>
      Expected: <code>${expectedOutput}</code><br>
      Your output: <code>${actualOutput.slice(0, 200)}${
      actualOutput.length > 200 ? '...' : ''
    }</code><br>
      <em>Compare your output carefully with what's expected.</em>
    `
    // Suggest general hints
    feedback.suggestedHints = availableHints.slice(0, 2)
  }

  // If we still have a generic message, provide more specific guidance
  if (feedback.detailedMessage === '') {
    feedback.detailedMessage = `
      <strong>❌ Cell ${cellIndex + 1} validation failed</strong><br>
      <em>Review your code logic and expected output format. Use the hints below for guidance.</em>
    `
    feedback.suggestedHints = availableHints.slice(0, 1)
  }

  return feedback
}

// Generate specific feedback for single-cell validation failures
function generateSpecificSingleCellFeedback (
  actualOutput,
  solution,
  stage,
  validationResult
) {
  const feedback = {
    statusText: 'Validation Failed',
    detailedMessage: '',
    suggestedHints: []
  }

  const availableHints = stage ? stage.hints || [] : []

  // Analyze validation failure type
  if (!actualOutput || actualOutput.trim() === '') {
    feedback.statusText = 'No Output'
    feedback.detailedMessage = `
      <strong>🚫 No output detected</strong><br>
      Your code ran but didn't produce any output. Make sure to:
      <ul>
        <li>Use <code>print()</code> statements to display results</li>
        <li>Check that your code is properly indented</li>
        <li>Verify your code actually executes the calculation</li>
      </ul>
    `
    feedback.suggestedHints = availableHints.slice(0, 1)
  } else if (validationResult && validationResult.reason) {
    // Use specific validation failure reason
    const reason = validationResult.reason.toLowerCase()

    if (reason.includes('pattern') || reason.includes('format')) {
      feedback.statusText = 'Format Issue'
      feedback.detailedMessage = `
        <strong>📋 Output format doesn't match expected pattern</strong><br>
        ${validationResult.reason}<br>
        <em>Check your output format and make sure it matches the expected structure.</em>
      `
      feedback.suggestedHints = availableHints
        .filter(
          hint =>
            hint.toLowerCase().includes('format') ||
            hint.toLowerCase().includes('output') ||
            hint.toLowerCase().includes('print')
        )
        .slice(0, 2)
    } else if (reason.includes('number') || reason.includes('calculation')) {
      feedback.statusText = 'Calculation Error'
      feedback.detailedMessage = `
        <strong>🔢 Mathematical calculation issue</strong><br>
        ${validationResult.reason}<br>
        <em>Double-check your calculations and variable assignments.</em>
      `
      feedback.suggestedHints = availableHints
        .filter(
          hint =>
            hint.toLowerCase().includes('calculat') ||
            hint.toLowerCase().includes('math') ||
            hint.toLowerCase().includes('number')
        )
        .slice(0, 2)
    } else if (reason.includes('code') || reason.includes('syntax')) {
      feedback.statusText = 'Code Issue'
      feedback.detailedMessage = `
        <strong>⚙️ Code structure issue</strong><br>
        ${validationResult.reason}<br>
        <em>Review your code logic and syntax.</em>
      `
      feedback.suggestedHints = availableHints
        .filter(
          hint =>
            hint.toLowerCase().includes('code') ||
            hint.toLowerCase().includes('syntax') ||
            hint.toLowerCase().includes('structure')
        )
        .slice(0, 2)
    } else {
      feedback.statusText = 'Validation Failed'
      feedback.detailedMessage = `
        <strong>❌ Solution doesn't meet requirements</strong><br>
        ${validationResult.reason}<br>
        <em>Review the challenge requirements and try again.</em>
      `
      feedback.suggestedHints = availableHints.slice(0, 2)
    }
  } else {
    // Generic validation failure
    feedback.statusText = 'Solution Incorrect'
    feedback.detailedMessage = `
      <strong>❌ Solution doesn't meet the challenge requirements</strong><br>
      <em>Review your code logic and the expected output. Use the hints below for guidance.</em>
    `
    feedback.suggestedHints = availableHints.slice(0, 1)
  }

  // Ensure we have some hints to suggest
  if (feedback.suggestedHints.length === 0 && availableHints.length > 0) {
    feedback.suggestedHints = availableHints.slice(0, 1)
  }

  return feedback
}

// Automatically show specific hints when validation fails
function showSpecificHints (suggestedHints) {
  if (!suggestedHints || suggestedHints.length === 0) return

  const hintTextContainer = document.getElementById('hint-text-container')
  if (!hintTextContainer) return

  // Clear existing auto-shown hints
  const existingAutoHints = hintTextContainer.querySelectorAll('.auto-hint')
  existingAutoHints.forEach(hint => hint.remove())

  // Show suggested hints automatically
  suggestedHints.forEach((hintText, index) => {
    const autoHintDiv = document.createElement('div')
    autoHintDiv.className = 'hint-text active auto-hint'
    autoHintDiv.innerHTML = `
      <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 4px; padding: 8px; margin: 4px 0;">
        <strong>💡 Suggested Hint:</strong> ${hintText}
      </div>
    `
    hintTextContainer.appendChild(autoHintDiv)
  })

  // Scroll to hints if they were added
  if (suggestedHints.length > 0) {
    hintTextContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

// Check if all cells in a multi-cell stage are completed
function checkAllCellsCompleted (totalCells) {
  // Count only completed cells in the current stage's cells container
  const cellsContainer = document.getElementById('cells-container')
  if (!cellsContainer) return

  const completedCells = cellsContainer.querySelectorAll(
    '.cell-status.completed'
  ).length

  console.log(
    `Stage ${currentStage}: ${completedCells} of ${totalCells} cells completed`
  )

  if (completedCells === totalCells) {
    // All cells completed, show next button
    document.getElementById('next-button').classList.add('active')
    if (!completedStages.includes(currentStage)) {
      completedStages.push(currentStage)
      updateDevNav()
    }
    console.log(
      `Stage ${currentStage} completed! All ${totalCells} cells done.`
    )
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
      // Solution is incorrect - provide specific feedback
      const outputArea = document.getElementById('single-cell-output')

      // Generate specific feedback for single-cell validation failure
      const specificFeedback = generateSpecificSingleCellFeedback(
        actualOutput,
        solution,
        stage,
        validationResult
      )
      cellStatus.textContent = specificFeedback.statusText
      cellStatus.className = 'cell-status error'

      // Clear previous feedback and add new specific feedback
      if (outputArea) {
        const existingFeedback = outputArea.querySelector('.cell-feedback')
        if (existingFeedback) {
          existingFeedback.remove()
        }

        // Add helpful feedback to the output area
        const feedbackDiv = document.createElement('div')
        feedbackDiv.className = 'cell-feedback'
        feedbackDiv.innerHTML = specificFeedback.detailedMessage
        outputArea.appendChild(feedbackDiv)

        // Automatically show relevant hints if validation fails
        if (specificFeedback.suggestedHints.length > 0) {
          showSpecificHints(specificFeedback.suggestedHints)
        }
      }

      // Show debug info in console
      console.log('Validation failed:', validationResult.reason)
      console.log('Expected patterns:', validationResult.expectedPatterns)
      console.log('User code:', code)
      console.log('Actual output:', actualOutput)
      console.log('Single-cell feedback:', specificFeedback)

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

// Restart runtime functionality - clears all cell outputs and resets execution state
function restartRuntime () {
  console.log(
    'Restarting runtime - clearing all cell outputs and execution state'
  )

  // Reset execution counter
  executionCounter = 0

  // Clear successful cell executions for current stage
  if (successfulCellExecutions[currentStage]) {
    successfulCellExecutions[currentStage].clear()
  }

  // Reset Skulpt environment by reinitializing it
  skulptEnvironment = null

  // Get current stage to determine whether it's single-cell or multi-cell
  const stage = gameContent.stages.find(s => s.id === currentStage)

  if (stage && stage.cells) {
    // Multi-cell stage: clear all cell outputs and reset states
    stage.cells.forEach((cell, index) => {
      // Reset cell number display
      const cellNumber = document.getElementById(`cell-number-${index}`)
      if (cellNumber) {
        cellNumber.innerHTML = `
          [ ]
          <svg class="play-icon" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg class="stop-icon" viewBox="0 0 24 24" style="display: none;">
            <rect x="6" y="6" width="12" height="12"/>
          </svg>
        `
        cellNumber.classList.remove('executed', 'running')
      }

      // Reset cell status
      const cellStatus = document.getElementById(`cell-status-${index}`)
      if (cellStatus) {
        cellStatus.textContent = 'Pending'
        cellStatus.className = 'cell-status pending'
      }

      // Clear output area
      const outputArea = document.getElementById(`output-area-${index}`)
      if (outputArea) {
        outputArea.textContent = ''
        outputArea.classList.remove('success', 'error')
        outputArea.classList.add('empty')
      }

      // Hide output container
      const outputContainer = document.getElementById(
        `output-container-${index}`
      )
      if (outputContainer) {
        outputContainer.style.display = 'none'
      }

      // Clear execution counter
      const outputCounter = document.getElementById(`output-counter-${index}`)
      if (outputCounter) {
        outputCounter.textContent = ''
      }
    })
  } else {
    // Single-cell stage: clear output and reset state
    const cellNumber = document.getElementById('single-cell-number')
    if (cellNumber) {
      cellNumber.innerHTML = `
        [ ]
        <svg class="play-icon" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg class="stop-icon" viewBox="0 0 24 24" style="display: none;">
          <rect x="6" y="6" width="12" height="12"/>
        </svg>
      `
      cellNumber.classList.remove('executed', 'running')
    }

    const cellStatus = document.getElementById('single-cell-status')
    if (cellStatus) {
      cellStatus.textContent = 'Pending'
      cellStatus.className = 'cell-status pending'
    }

    const outputArea = document.getElementById('single-output-area')
    if (outputArea) {
      outputArea.textContent = ''
      outputArea.classList.remove('success', 'error')
      outputArea.classList.add('empty')
    }

    const outputContainer = document.getElementById('single-output-container')
    if (outputContainer) {
      outputContainer.style.display = 'none'
    }
  }

  // Update execution indicators
  updateCellExecutionIndicators()

  // Show confirmation message
  console.log('Runtime restart complete - all cells cleared')

  // Brief visual feedback
  const restartButton = document.getElementById('restart-runtime-button')
  if (restartButton) {
    const originalText = restartButton.innerHTML
    restartButton.innerHTML = '✓ Runtime Restarted'
    restartButton.style.background = '#34a853'
    setTimeout(() => {
      restartButton.innerHTML = originalText
      restartButton.style.background = '#ea4335'
    }, 1500)
  }
}

// Set up restart runtime button event listener
document.addEventListener('DOMContentLoaded', () => {
  initializeGame()

  // Set up restart runtime button
  const restartButton = document.getElementById('restart-runtime-button')
  if (restartButton) {
    restartButton.addEventListener('click', restartRuntime)
  }
})

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

// LLM Integration with Ollama
class OllamaLLMIntegration {
  constructor () {
    this.selectedModel = null
    this.models = []
    this.setupEventListeners()

    // Show the footer by default (remove hidden class)
    const footer = document.querySelector('.llm-footer')
    if (footer) {
      footer.classList.remove('hidden')
    }
  }
  init () {
    // Hide footer by default
    const footer = document.querySelector('.llm-footer')
    // if (footer) footer.classList.add('hidden')

    this.setupEventListeners()
    this.loadModels()
  }
  setupEventListeners () {
    const toggle = document.getElementById('llm-enabled')
    const modelSelect = document.getElementById('model-select')
    const refreshBtn = document.getElementById('refresh-models')
    const changeModelBtn = document.getElementById('change-model')

    toggle.addEventListener('change', e => {
      this.toggleLLM(e.target.checked)
    })

    modelSelect.addEventListener('change', e => {
      this.selectedModel = e.target.value
      if (this.selectedModel) {
        this.updateModelInfo()
        this.updateStatus('connected', `Connected to ${this.selectedModel}`)
        this.updateQueryButtonStates()
        this.hideModelSelection()
      }
    })

    refreshBtn.addEventListener('click', () => {
      this.loadModels()
    })

    changeModelBtn.addEventListener('click', () => {
      this.showModelSelection()
    })
  }
  toggleLLM (enabled) {
    this.isEnabled = enabled
    const settings = document.getElementById('llm-settings')
    const footer = document.querySelector('.llm-footer')

    if (enabled) {
      settings.style.display = 'block'
      // if (footer) footer.classList.remove('hidden')
      this.loadModels()
      this.updateHintSystem()
      // Hide model selection initially, just show the selected model info
      this.hideModelSelection()
    } else {
      settings.style.display = 'none'
      // if (footer) footer.classList.add('hidden')
      this.updateStatus('disconnected', 'LLM Assistant disabled')
      this.restoreOriginalHints()
    }
  }
  async loadModels () {
    this.updateStatus('connecting', 'Loading models...')

    try {
      const response = await fetch(`http://localhost:11434/api/tags`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      this.populateModelSelect(data.models || [])
      this.isConnected = true

      if (data.models && data.models.length > 0) {
        // Auto-select the first available model
        this.selectedModel = data.models[0].name
        document.getElementById('model-select').value = this.selectedModel
        this.updateModelInfo()
        this.updateStatus('connected', `Connected to ${this.selectedModel}`)
        this.updateQueryButtonStates()
      } else {
        this.updateStatus('error', 'No models available')
      }
    } catch (error) {
      console.error('Failed to load Ollama models:', error)
      this.isConnected = false
      this.updateStatus(
        'error',
        "Ollama not available - check if it's running on localhost:11434"
      )
      this.populateModelSelect([])
    }
  }

  populateModelSelect (models) {
    const select = document.getElementById('model-select')
    select.innerHTML = '<option value="">Select a model...</option>'

    models.forEach(model => {
      const option = document.createElement('option')
      option.value = model.name
      option.textContent = `${model.name} (${this.formatSize(model.size)})`
      select.appendChild(option)
    })
  }

  formatSize (bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
  updateStatus (type, message) {
    const status = document.getElementById('llm-status')
    status.className = `llm-status ${type}`
    status.textContent = message
  }

  updateModelInfo () {
    const modelInfo = document.getElementById('llm-model-info')
    if (this.selectedModel) {
      modelInfo.textContent = this.selectedModel
      modelInfo.style.display = 'inline-block'
    } else {
      modelInfo.textContent = 'No model selected'
      modelInfo.style.display = 'none'
    }
  }

  showModelSelection () {
    const modelSelection = document.getElementById('model-selection')
    if (modelSelection) {
      modelSelection.style.display = 'flex'
    }
  }

  hideModelSelection () {
    const modelSelection = document.getElementById('model-selection')
    if (modelSelection) {
      modelSelection.style.display = 'none'
    }
  }
  updateHintSystem () {
    // Replace traditional hint buttons with LLM query options
    const hintsContainer = document.getElementById('hints-container')
    if (!hintsContainer) return

    // Clear existing hints
    hintsContainer.innerHTML = ''

    // Add LLM query buttons
    const queryButtons = [
      { text: '🤔 I need guidance', type: 'general' },
      { text: '🐛 Help me debug', type: 'debug' },
      { text: '📚 Explain concepts', type: 'concepts' },
      { text: '💡 Give me a hint', type: 'hint' }
    ]

    queryButtons.forEach(button => {
      const btn = document.createElement('button')
      btn.className = 'llm-query-button'
      btn.textContent = button.text
      btn.onclick = () => this.queryLLM(button.type)
      btn.disabled = !this.selectedModel
      hintsContainer.appendChild(btn)
    })
  }

  updateQueryButtonStates () {
    // Update the disabled state of query buttons based on model selection
    const queryButtons = document.querySelectorAll('.llm-query-button')
    queryButtons.forEach(btn => {
      btn.disabled = !this.selectedModel
    })
  }

  restoreOriginalHints () {
    // Restore the original hint system
    const stage = gameContent.stages.find(s => s.id === currentStage)
    if (stage) {
      setupHints(stage)
    }
  }

  async queryLLM (queryType) {
    if (!this.selectedModel || !this.isConnected) {
      this.showLLMResponse('error', 'Please select a model first')
      return
    }

    const stage = gameContent.stages.find(s => s.id === currentStage)
    if (!stage) return

    const query = this.buildQuery(queryType, stage)

    // Show loading state
    this.showLLMResponse('loading', 'Thinking... 🤔')

    try {
      const response = await this.sendOllamaRequest(query)
      this.showLLMResponse('success', response)
    } catch (error) {
      console.error('LLM query failed:', error)
      this.showLLMResponse(
        'error',
        'Failed to get response from LLM. Please try again.'
      )
    }
  }
  buildQuery (queryType, stage) {
    const currentCode = this.getCurrentCode()
    const stageContext = {
      title: stage.title,
      story: stage.story,
      challenge: stage.challenge,
      instruction: stage.instruction
    }

    const baseContext = `
You are an AI coding tutor helping someone learn Python programming through an archaeological adventure game.

Current Stage: "${stageContext.title}"
Story Context: ${stageContext.story}
Challenge: ${stageContext.challenge}
Instruction: ${stageContext.instruction}

Current Code:
\`\`\`python
${currentCode || '# No code written yet'}
\`\`\`

CRITICAL RULES:
1. NEVER provide complete working code solutions
2. NEVER write the full answer for them
3. Address the user directly (use "you" not "the student")
4. Guide them step-by-step with educational hints
5. Ask guiding questions to help them think
6. Focus on teaching concepts, not solving problems
7. Keep responses concise and actionable
8. Do NOT use thinking tags like <think>, <thinking>, or any internal reasoning markers
9. Start your response immediately with helpful guidance - no preamble or meta-commentary
10. Provide direct, actionable educational content only
`

    const queryTypes = {
      general: `${baseContext}

You're asking for general help with this challenge. I'll guide you with questions and hints:

First, let me help you break this down:
- What do you think the main goal of this challenge is?
- What Python concepts might be useful here? (Think about: variables, loops, conditionals, functions, etc.)
- Can you identify the key steps you need to take?

Based on your current code, I'll give you some guidance on the right direction to explore, but you'll need to figure out the specific implementation.`,

      debug: `${baseContext}

Let me help you debug your approach by asking some guiding questions:

Looking at your current code, I want you to think about:
- What do you expect each line to do?
- Are there any error messages you're seeing?
- What happens when you run it vs. what you expected?

I'll point out potential issues I notice and suggest debugging strategies, but you'll need to identify and fix the specific problems.`,

      concepts: `${baseContext}

Let me explain the key programming concepts you'll need for this challenge:

I'll break down the relevant Python concepts and explain how they work in general terms. Then I'll ask you to think about how these concepts might apply to your specific challenge.

The goal is for you to understand the "why" behind the code, not just the "what".`,

      hint: `${baseContext}

Here's a focused hint for your next step:

I'll look at where you are now and suggest what you should try next. I'll give you just enough guidance to move forward, but you'll need to figure out the specific implementation.

Think about it step by step, and don't hesitate to ask for clarification if you need it!`
    }

    return queryTypes[queryType] || queryTypes.general
  }

  getCurrentCode () {
    // Get current code from either single-cell or multi-cell editor
    if (
      document.getElementById('single-cell-container').style.display !== 'none'
    ) {
      // Single-cell stage
      return editor ? editor.getValue() : ''
    } else {
      // Multi-cell stage - get code from all cells
      const allCode = cellEditors
        .map((cellEditor, index) => {
          const code = cellEditor.getValue()
          return code ? `# Cell ${index + 1}\n${code}` : ''
        })
        .filter(code => code)
        .join('\n\n')
      return allCode
    }
  }
  async sendOllamaRequest (prompt) {
    const response = await fetch(`http://localhost:11434/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.selectedModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500, // Increased slightly for better responses
          top_p: 0.9,
          stop: [
            '```python',
            'def ',
            'print(',
            '# Solution:',
            'The complete code is:',
            "Here's the solution:",
            'The answer is:',
            'Solution:'
          ] // Enhanced stop tokens to prevent thinking tags and solutions
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    return this.processLLMResponse(data.response)
  }
  processLLMResponse (rawResponse) {
    console.log('Raw LLM response:', rawResponse)
    // Remove thinking tags and content - handle multiple variations and incomplete tags
    let cleanedResponse = rawResponse

    // Remove complete thinking tag pairs
    cleanedResponse = cleanedResponse.replace(/<think>[\s\S]*?<\/think>/gi, '')
    cleanedResponse = cleanedResponse.replace(
      /<thinking>[\s\S]*?<\/thinking>/gi,
      ''
    )

    // Remove incomplete thinking tags (just opening tags with content after)
    cleanedResponse = cleanedResponse.replace(/<think>[\s\S]*/gi, '')
    cleanedResponse = cleanedResponse.replace(/<thinking>[\s\S]*/gi, '')

    // Remove any remaining orphaned closing tags
    cleanedResponse = cleanedResponse.replace(/<\/think>/gi, '')
    cleanedResponse = cleanedResponse.replace(/<\/thinking>/gi, '')

    // If the response is now empty or very short, provide a fallback
    if (cleanedResponse.trim().length < 10) {
      cleanedResponse =
        "I'd be happy to help you with this challenge! Let me know what specific part you're struggling with and I'll guide you through it step by step."
    }

    // Filter out potential code solutions that might slip through
    const codeBlockRegex = /```python[\s\S]*?```/gi
    const hasCodeBlock = codeBlockRegex.test(cleanedResponse)

    if (hasCodeBlock) {
      // If there's a Python code block, replace it with a guidance message
      cleanedResponse = cleanedResponse.replace(
        codeBlockRegex,
        '*(I notice you need to write some code here - try thinking through the logic step by step!)*'
      )
    }

    // Only filter out lines that are clearly complete solutions, not educational content
    const lines = cleanedResponse.split('\n')
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim()

      // Only skip lines that are clearly complete Python code solutions
      // Be more selective to avoid removing educational content
      if (
        (trimmed.startsWith('def ') && trimmed.includes('():')) ||
        trimmed.match(/^\s*\w+\s*=\s*input\(.*\)\s*$/) ||
        trimmed.match(/^\s*for\s+\w+\s+in\s+.*:\s*$/) ||
        (trimmed.match(/^\s*if\s+.*:\s*$/) && line.length > 50) ||
        trimmed.match(/^\s*print\([^)]*\)\s*$/)
      ) {
        return false
      }
      return true
    })

    cleanedResponse = filteredLines.join('\n')

    // Clean up any extra whitespace
    cleanedResponse = cleanedResponse.trim()

    // Final check for empty response after all filtering
    if (cleanedResponse.length === 0) {
      cleanedResponse =
        "I'm here to help! Could you tell me more about what you're trying to accomplish with this challenge?"
    }

    // Convert markdown to HTML
    return this.markdownToHtml(cleanedResponse)
  }
  markdownToHtml (markdown) {
    // Simple markdown to HTML converter for common formatting
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')

      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Code blocks
      .replace(
        /```python\n([\s\S]*?)\n```/g,
        '<pre><code class="language-python">$1</code></pre>'
      )
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')

    // Handle lists more carefully
    const lines = html.split('\n')
    const processedLines = []
    let inList = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const isListItem = line.match(/^[*-]\s+(.*)/)

      if (isListItem) {
        if (!inList) {
          processedLines.push('<ul>')
          inList = true
        }
        processedLines.push(`<li>${isListItem[1]}</li>`)
      } else {
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        if (line) {
          processedLines.push(line)
        }
      }
    }

    // Close any remaining list
    if (inList) {
      processedLines.push('</ul>')
    }

    html = processedLines.join('\n')

    // Convert line breaks to paragraphs and <br> tags
    html = html
      .replace(/\n\n+/g, '</p><p>') // Double line breaks become paragraph breaks
      .replace(/\n/g, '<br>') // Single line breaks become <br>    // Wrap content in paragraphs if not already wrapped in block elements
    if (
      !html.includes('<p>') &&
      !html.includes('<h') &&
      !html.includes('<ul>') &&
      !html.includes('<pre>')
    ) {
      html = '<p>' + html + '</p>'
    } else if (html.includes('</p><p>')) {
      // Properly wrap the content that has paragraph breaks
      html = '<p>' + html + '</p>'
    }

    return html
  }
  showLLMResponse (type, content) {
    const hintTextContainer = document.getElementById('hint-text-container')
    if (!hintTextContainer) {
      console.error('hint-text-container not found!')
      return
    }

    // Clear existing LLM responses
    const existingLLMHints = hintTextContainer.querySelectorAll('.llm-hint')
    existingLLMHints.forEach(hint => hint.remove())

    // Create new LLM response
    const llmHint = document.createElement('div')
    llmHint.className = `llm-hint ${type === 'success' ? '' : type}`

    const header = document.createElement('div')
    header.className = 'llm-header'

    if (type === 'loading') {
      header.innerHTML = '🤖 AI Assistant (thinking...)'
    } else if (type === 'error') {
      header.innerHTML = '🤖 AI Assistant (error)'
    } else {
      header.innerHTML = `🤖 AI Assistant (${this.selectedModel})`
    }

    const contentDiv = document.createElement('div')
    contentDiv.className = 'llm-content'

    // Use innerHTML for formatted content, textContent for plain text/errors
    if (type === 'success') {
      contentDiv.innerHTML = content
    } else {
      contentDiv.textContent = content
    }

    llmHint.appendChild(header)
    llmHint.appendChild(contentDiv)
    hintTextContainer.appendChild(llmHint)

    // Scroll to the response
    llmHint.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

// Initialize LLM integration when DOM is loaded
let ollamaLLM = null
