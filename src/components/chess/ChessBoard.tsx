
import React, { useState, useEffect } from 'react';
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
      <div className="bg-gradient-to-br from-purple-200 via-blue-200 to-cyan-200 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl border-4 border-gradient-to-r from-purple-500 to-blue-500">
        <div className="grid grid-cols-8 gap-0 aspect-square w-full border-6 border-gray-900 rounded-xl overflow-hidden shadow-inner">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const displayRow = playerColor === 'white' ? rowIndex : 7 - rowIndex;
              const displayCol = playerColor === 'white' ? colIndex : 7 - colIndex;
              
              return (
                <div
                  key={`${displayRow}-${displayCol}`}
                  className={`
                    aspect-square flex items-center justify-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black cursor-pointer
                    transition-all duration-300 hover:scale-110 active:scale-95 relative border-2 border-gray-800/50
                    ${isLightSquare(displayRow, displayCol) 
                      ? 'bg-gradient-to-br from-amber-100 to-yellow-200 hover:from-amber-200 hover:to-yellow-300 active:from-amber-300 active:to-yellow-400' 
                      : 'bg-gradient-to-br from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 active:from-amber-800 active:to-orange-900'
                    }
                    ${isSquareHighlighted(displayRow, displayCol) 
                      ? 'ring-6 sm:ring-8 ring-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-2xl transform scale-105' 
                      : ''
                    }
                    ${isPossibleMove(displayRow, displayCol) 
                      ? 'after:absolute after:inset-3 sm:after:inset-4 after:bg-gradient-to-br after:from-green-400 after:to-emerald-500 after:rounded-full after:opacity-90 after:shadow-xl after:animate-pulse after:border-2 after:border-green-600' 
                      : ''
                    }
                    ${disabled || !isPlayerTurn ? 'cursor-default opacity-70' : 'cursor-pointer'}
                    ${!isPlayerTurn ? 'pointer-events-none' : ''}
                    shadow-lg hover:shadow-xl
                  `}
                  onClick={() => handleSquareClick(displayRow, displayCol)}
                >
                  <span className="z-10 drop-shadow-2xl select-none filter contrast-125 brightness-110 text-shadow-lg">
                    {getPieceSymbol(piece)}
                  </span>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 sm:mt-6 text-center text-base sm:text-lg font-bold">
          <div className="text-purple-800 text-xl sm:text-2xl font-black">
            Playing as {playerColor === 'white' ? '⚪ White' : '⚫ Black'}
          </div>
          {!isPlayerTurn && !disabled && (
            <div className="text-orange-600 animate-pulse mt-3 text-lg font-bold bg-orange-100 rounded-full px-4 py-2 inline-block">
              🔄 Waiting for opponent's move...
            </div>
          )}
          {disabled && (
            <div className="text-gray-600 mt-3 text-lg font-bold bg-gray-100 rounded-full px-4 py-2 inline-block">
              👁️ Spectating
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
