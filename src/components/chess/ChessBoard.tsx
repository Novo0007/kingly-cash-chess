
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
    }, 400);
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
    <div className="flex flex-col items-center w-full px-2 sm:px-4">
      <div className="bg-gradient-to-br from-amber-100 to-orange-200 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-6xl border-4 border-amber-600">
        <div ref={boardRef} className="grid grid-cols-8 gap-0 aspect-square w-full border-4 border-gray-800 rounded-xl overflow-hidden shadow-lg relative">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const displayRow = playerColor === 'white' ? rowIndex : 7 - rowIndex;
              const displayCol = playerColor === 'white' ? colIndex : 7 - colIndex;
              
              return (
                <div
                  key={`${displayRow}-${displayCol}`}
                  className={`
                    aspect-square flex items-center justify-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold cursor-pointer
                    transition-all duration-300 hover:scale-105 active:scale-95 relative
                    ${isLightSquare(displayRow, displayCol) 
                      ? 'bg-amber-50 hover:bg-amber-100' 
                      : 'bg-amber-800 hover:bg-amber-700'
                    }
                    ${isSquareHighlighted(displayRow, displayCol) 
                      ? 'ring-4 ring-blue-500 bg-blue-200 shadow-lg' 
                      : ''
                    }
                    ${isPossibleMove(displayRow, displayCol) 
                      ? 'after:absolute after:inset-1/3 after:bg-green-500 after:rounded-full after:opacity-80' 
                      : ''
                    }
                    ${disabled || !isPlayerTurn ? 'cursor-default opacity-70' : 'cursor-pointer'}
                    ${!isPlayerTurn ? 'pointer-events-none' : ''}
                  `}
                  onClick={() => handleSquareClick(displayRow, displayCol)}
                >
                  <span className={`
                    z-10 drop-shadow-lg select-none transition-all duration-400 ease-in-out
                    ${movingPiece?.from === getSquareName(displayRow, displayCol) ? 'transform scale-110 translate-x-2 translate-y-2' : ''}
                  `}>
                    {getPieceSymbol(piece)}
                  </span>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 sm:mt-6 text-center">
          <div className="text-gray-700 text-xl sm:text-2xl font-bold">
            Playing as {playerColor === 'white' ? '⚪ White' : '⚫ Black'}
          </div>
          {!isPlayerTurn && !disabled && (
            <div className="text-orange-600 mt-2 text-lg font-bold bg-orange-100 rounded-lg px-4 py-2 inline-block">
              Waiting for opponent's move...
            </div>
          )}
          {disabled && (
            <div className="text-gray-600 mt-2 text-lg font-bold bg-gray-100 rounded-lg px-4 py-2 inline-block">
              Spectating
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
