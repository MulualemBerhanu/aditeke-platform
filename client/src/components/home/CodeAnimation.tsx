import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface CodeLine {
  code: string;
  indent: number;
  highlight: boolean;
  isFading?: boolean;
}

// Sample code snippets that look impressive
const CODE_SNIPPETS = [
  // Java welcome message
  [
    { indent: 0, code: "public class AdiTekeWelcome {", highlight: false },
    { indent: 1, code: "public static void main(String[] args) {", highlight: false },
    { indent: 2, code: "System.out.println(\"Welcome to AdiTeke Software Solutions!\");", highlight: true },
    { indent: 2, code: "System.out.println(\"Building innovative digital experiences\");", highlight: false },
    { indent: 2, code: "startServices();", highlight: false },
    { indent: 1, code: "}", highlight: false },
    { indent: 0, code: "}", highlight: false },
  ],
  // Python welcome message
  [
    { indent: 0, code: "class AdiTekeSolutions:", highlight: false },
    { indent: 1, code: "def __init__(self):", highlight: false },
    { indent: 2, code: "self.company = \"AdiTeke Software Solutions\"", highlight: false },
    { indent: 2, code: "self.founded = 2018", highlight: false },
    { indent: 1, code: "", highlight: false },
    { indent: 1, code: "def welcome_message(self):", highlight: false },
    { indent: 2, code: "print(f\"Welcome to {self.company}!\")", highlight: true },
    { indent: 2, code: "print(\"Transforming ideas into powerful digital products\")", highlight: false },
    { indent: 0, code: "", highlight: false },
    { indent: 0, code: "aditeke = AdiTekeSolutions()", highlight: false },
    { indent: 0, code: "aditeke.welcome_message()", highlight: false },
  ],
  // JavaScript/TypeScript
  [
    { indent: 0, code: "const createAIModel = async () => {", highlight: false },
    { indent: 1, code: "console.log(\"Welcome to AdiTeke Software Solutions!\");", highlight: true },
    { indent: 1, code: "const model = await tf.loadLayersModel('https://ai.aditeke.com/models/v2');", highlight: false },
    { indent: 1, code: "const prediction = model.predict(tensorData);", highlight: false },
    { indent: 1, code: "return processResults(prediction);", highlight: false },
    { indent: 0, code: "};", highlight: false },
  ],
  [
    { indent: 0, code: "class BlockchainService {", highlight: false },
    { indent: 1, code: "constructor(network: Network) {", highlight: false },
    { indent: 2, code: "console.log(\"AdiTeke Software Solutions - Blockchain Division\");", highlight: true },
    { indent: 2, code: "this.web3 = new Web3(network.endpoint);", highlight: false },
    { indent: 2, code: "this.contracts = this.loadContracts();", highlight: false },
    { indent: 1, code: "}", highlight: false },
    { indent: 0, code: "}", highlight: false },
  ],
  [
    { indent: 0, code: "async function analyzeData(dataset) {", highlight: false },
    { indent: 1, code: "const insights = await ML.process(dataset);", highlight: false },
    { indent: 1, code: "visualizeResults(insights);", highlight: true },
    { indent: 1, code: "return generateReport(insights);", highlight: false },
    { indent: 0, code: "}", highlight: false },
  ],
  [
    { indent: 0, code: "const secureAPI = (req, res, next) => {", highlight: false },
    { indent: 1, code: "const token = req.headers.authorization;", highlight: false },
    { indent: 1, code: "if (jwt.verify(token, process.env.SECRET_KEY)) {", highlight: true },
    { indent: 2, code: "next();", highlight: false },
    { indent: 1, code: "} else {", highlight: false },
    { indent: 2, code: "res.status(401).send('Unauthorized');", highlight: false },
    { indent: 1, code: "}", highlight: false },
    { indent: 0, code: "};", highlight: false },
  ]
];

interface CodeAnimationProps {
  duration?: number;
  position?: 'left' | 'right';
  opacity?: number;
  className?: string;
  codeSpeed?: number;
  theme?: 'dark' | 'light';
  width?: string;
  height?: string;
}

const CodeAnimation = ({ 
  duration = 15, 
  position = 'right',
  opacity = 0.8,
  className = '',
  codeSpeed = 2,
  theme = 'dark',
  width = '100%',
  height = '100%'
}: CodeAnimationProps) => {
  const [codeLines, setCodeLines] = useState<CodeLine[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();
  
  // Colors based on theme
  const bgColor = theme === 'dark' ? 'rgba(13, 17, 40, 0.65)' : 'rgba(240, 245, 255, 0.8)';
  const textColor = theme === 'dark' ? '#e6f1ff' : '#0a101f';
  const keywordColor = theme === 'dark' ? '#ff79c6' : '#d33682';
  const stringColor = theme === 'dark' ? '#addb67' : '#2aa198';
  const commentColor = theme === 'dark' ? '#637777' : '#93a1a1';
  const functionColor = theme === 'dark' ? '#82aaff' : '#268bd2';
  const variableColor = theme === 'dark' ? '#ffcc66' : '#cb4b16';
  const highlightBg = theme === 'dark' ? 'rgba(100, 114, 222, 0.15)' : 'rgba(38, 139, 210, 0.15)';
  
  // Function to colorize code
  const colorizeCode = (code: string) => {
    return code
      .replace(/\b(const|let|var|function|class|async|await|if|else|return|this|new|import|export|from|true|false)\b/g, 
        match => `<span style="color: ${keywordColor}">${match}</span>`)
      .replace(/(['"]).*?\1/g, 
        match => `<span style="color: ${stringColor}">${match}</span>`)
      .replace(/\/\/.*$/g, 
        match => `<span style="color: ${commentColor}">${match}</span>`)
      .replace(/\b([A-Za-z]+)(?=\()/g, 
        match => `<span style="color: ${functionColor}">${match}</span>`)
      .replace(/\b([A-Za-z][A-Za-z0-9]*)(?=[.\[]|\s*=)/g, 
        match => `<span style="color: ${variableColor}">${match}</span>`);
  };

  useEffect(() => {
    // Initialize the animation
    const addCodeLine = () => {
      setCodeLines(prevLines => {
        // Keep maximum 15 lines
        const newLines = [...prevLines];
        if (newLines.length > 15) {
          newLines.splice(0, newLines.length - 15);
        }
        
        // Decide if we should add a new line or switch to a new snippet
        const shouldAddNewSnippet = Math.random() > 0.7 || newLines.length === 0;
        
        if (shouldAddNewSnippet) {
          // Pick a random code snippet
          const randomSnippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
          // Transform the snippet into CodeLine objects
          return [...newLines, ...randomSnippet.map(line => ({
            ...line,
            highlight: line.highlight,
            isFading: false
          }))];
        } else {
          // Add a blinking cursor to the last line
          const updatedLines = [...newLines];
          const lastLine = updatedLines[updatedLines.length - 1];
          if (lastLine) {
            lastLine.code += ' ';
          }
          return updatedLines;
        }
      });
    };

    // Start cycling through code lines
    intervalRef.current = setInterval(addCodeLine, codeSpeed * 1000);
    
    // Clean up intervals on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [codeSpeed]);

  // Animation for the floating effect
  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);

  return (
    <motion.div 
      className={`code-animation-container ${className}`}
      style={{ 
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        fontSize: '0.7rem',
        fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
        borderRadius: '8px',
        opacity,
        backgroundColor: bgColor,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem',
        color: textColor
      }}
      animate={controls}
    >
      {/* Code Header - mimics a code editor UI */}
      <div className="code-header" style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        marginBottom: '8px',
        paddingBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
        </div>
        <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>
          aditeke-{Math.floor(Math.random() * 100)}.tsx
        </div>
      </div>
      
      {/* Line Numbers and Code */}
      <div className="code-content" style={{ position: 'relative' }}>
        {codeLines.map((line, index) => (
          <div 
            key={index} 
            className={`code-line ${line.highlight ? 'highlight' : ''}`}
            style={{ 
              display: 'flex',
              transition: 'all 0.3s ease',
              position: 'relative',
              backgroundColor: line.highlight ? highlightBg : 'transparent',
              borderRadius: '3px',
              marginBottom: '2px',
              padding: '1px 0'
            }}
          >
            {/* Line number */}
            <div 
              className="line-number" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.3)', 
                marginRight: '10px',
                width: '20px',
                textAlign: 'right',
                userSelect: 'none'
              }}
            >
              {index + 1}
            </div>
            
            {/* Indentation */}
            <div 
              className="indentation" 
              style={{ 
                width: `${line.indent * 20}px`
              }}
            />
            
            {/* Code */}
            <div 
              className="code" 
              dangerouslySetInnerHTML={{ 
                __html: colorizeCode(line.code)
              }}
            />
          </div>
        ))}
        
        {/* Blinking cursor */}
        <div 
          className="cursor" 
          style={{ 
            position: 'absolute', 
            bottom: '2px', 
            width: '8px', 
            height: '14px', 
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            animation: 'blink 1s step-end infinite'
          }}
        />
      </div>
      
      {/* Add a subtle css animation for the cursor */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          
          .code-line {
            animation: fadeIn 0.3s ease-in;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </motion.div>
  );
};

export default CodeAnimation;