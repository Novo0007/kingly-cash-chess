
import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';

interface ChessBoardProps {
  fen?: string;
  onMove?: (from: string, to: string) => void;
  playerColor?: 'white' | 'black';
  disabled?: boolean;
  isPlayerTurn?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  onMove,
  playerColor = 'white',
  disabled = false,
  isPlayerTurn = true
}) => {
  const [chess, setChess] = useState(new Chess(fen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [board, setBoard] = useState(chess.board());
  const [movingPiece, setMovingPiece] = useState<{from: string, to: string} | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const newChess = new Chess(fen);
      setChess(newChess);
      setBoard(newChess.board());
      setSelectedSquare(null);
      setPossibleMoves([]);
    } catch (error) {
      console.error('Invalid FEN:', fen, error);
    }
  }, [fen]);

  const getPieceSymbol = (piece: any) => {
    if (!piece) return '';
    
    const symbols = {
      'p': piece.color === 'w' ? '♙' : '♟',
      'r': piece.color === 'w' ? '♖' : '♜',
      'n': piece.color === 'w' ? '♘' : '♞',
      'b': piece.color === 'w' ? '♗' : '♝',
      'q': piece.color === 'w' ? '♕' : '♛',
      'k': piece.color === 'w' ? '♔' : '♚'
    };
    
    return symbols[piece.type as keyof typeof symbols] || '';
  };

  const getSquareName = (row: number, col: number): Square => {
    const files = 'abcdefgh';
    const rank = playerColor === 'white' ? 8 - row : row + 1;
    const file = playerColor === 'white' ? files[col] : files[7 - col];
    return `${file}${rank}` as Square;
  };

  const animateMove = (from: string, to: string) => {
    setMovingPiece({ from, to });
    setTimeout(() => {
      setMovingPiece(null);
    }, 300);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (disabled || !isPlayerTurn) return;

    const square = getSquareName(row, col);
    
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Try to make a move
      if (possibleMoves.includes(square)) {
        console.log('Making move:', selectedSquare, 'to', square);
        animateMove(selectedSquare, square);
        onMove?.(selectedSquare, square);
      } else {
        // Check if clicking on another piece of same color
        const piece = chess.get(square);
        if (piece && ((playerColor === 'white' && piece.color === 'w') || (playerColor === 'black' && piece.color === 'b'))) {
          setSelectedSquare(square);
          const moves = chess.moves({ square, verbose: true });
          setPossibleMoves(moves.map(move => move.to));
        } else {
          console.log('Invalid move attempted:', selectedSquare, 'to', square);
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
      
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      const piece = chess.get(square);
      if (piece && !disabled && isPlayerTurn) {
        // Only allow selecting your own pieces
        const canSelectPiece = (
          (playerColor === 'white' && piece.color === 'w') || 
          (playerColor === 'black' && piece.color === 'b')
        );

        if (canSelectPiece) {
          setSelectedSquare(square);
          const moves = chess.moves({ square, verbose: true });
          setPossibleMoves(moves.map(move => move.to));
        }
      }
    }
  };

  const isSquareHighlighted = (row: number, col: number) => {
    const square = getSquareName(row, col);
    return selectedSquare === square;
  };

  const isPossibleMove = (row: number, col: number) => {
    const square = getSquareName(row, col);
    return possibleMoves.includes(square);
  };

  const isLightSquare = (row: number, col: number) => {
    return (row + col) % 2 === 0;
  };

  return (
    <div className="flex flex-col items-center w-full px-1 sm:px-4">
      <div className="bg-gradient-to-br from-purple-300 via-blue-300 to-cyan-300 p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-5xl border-6 border-gradient-to-r from-purple-600 to-blue-600 transform hover:scale-[1.02] transition-all duration-500">
        <div ref={boardRef} className="grid grid-cols-8 gap-0 aspect-square w-full border-8 border-gray-900 rounded-2xl overflow-hidden shadow-2xl relative">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const displayRow = playerColor === 'white' ? rowIndex : 7 - rowIndex;
              const displayCol = playerColor === 'white' ? colIndex : 7 - colIndex;
              
              return (
                <div
                  key={`${displayRow}-${displayCol}`}
                  className={`
                    aspect-square flex items-center justify-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black cursor-pointer
                    transition-all duration-500 hover:scale-110 active:scale-95 relative border-3 border-gray-800/60
                    ${isLightSquare(displayRow, displayCol) 
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 active:from-amber-200 active:to-yellow-300' 
                      : 'bg-gradient-to-br from-amber-800 to-orange-900 hover:from-amber-700 hover:to-orange-800 active:from-amber-900 active:to-orange-950'
                    }
                    ${isSquareHighlighted(displayRow, displayCol) 
                      ? 'ring-8 sm:ring-10 ring-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-2xl transform scale-105 animate-pulse' 
                      : ''
                    }
                    ${isPossibleMove(displayRow, displayCol) 
                      ? 'after:absolute after:inset-2 sm:after:inset-3 after:bg-gradient-to-br after:from-green-400 after:to-emerald-500 after:rounded-full after:opacity-90 after:shadow-xl after:animate-bounce after:border-3 after:border-green-600' 
                      : ''
                    }
                    ${disabled || !isPlayerTurn ? 'cursor-default opacity-70' : 'cursor-pointer'}
                    ${!isPlayerTurn ? 'pointer-events-none' : ''}
                    shadow-xl hover:shadow-2xl transform hover:translate-y-[-2px]
                  `}
                  onClick={() => handleSquareClick(displayRow, displayCol)}
                >
                  <span className={`
                    z-10 drop-shadow-2xl select-none filter contrast-125 brightness-110 text-shadow-2xl
                    transition-all duration-300 hover:scale-110 hover:rotate-12 hover:drop-shadow-3xl
                    ${movingPiece?.from === getSquareName(displayRow, displayCol) ? 'animate-bounce scale-125' : ''}
                  `}>
                    {getPieceSymbol(piece)}
                  </span>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-6 sm:mt-8 text-center text-lg sm:text-xl font-black">
          <div className="text-purple-900 text-2xl sm:text-3xl font-black animate-pulse">
            Playing as {playerColor === 'white' ? '⚪ White' : '⚫ Black'}
          </div>
          {!isPlayerTurn && !disabled && (
            <div className="text-orange-700 animate-bounce mt-4 text-xl font-black bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full px-6 py-3 inline-block shadow-lg border-2 border-orange-400">
              🔄 Waiting for opponent's move...
            </div>
          )}
          {disabled && (
            <div className="text-gray-700 mt-4 text-xl font-black bg-gradient-to-r from-gray-200 to-gray-300 rounded-full px-6 py-3 inline-block shadow-lg border-2 border-gray-400">
              👁️ Spectating
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
