
import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';

interface ChessBoardProps {
  fen?: string;
  onMove?: (from: string, to: string) => void;
  playerColor?: 'white' | 'black';
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  onMove,
  playerColor = 'white',
  disabled = false
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
    if (disabled) return;

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
        // Invalid move, clear selection
        console.log('Invalid move attempted:', selectedSquare, 'to', square);
      }
      
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      const piece = chess.get(square);
      if (piece && !disabled) {
        // Only allow selecting your own pieces
        const canSelectPiece = (
          (playerColor === 'white' && piece.color === 'w' && chess.turn() === 'w') || 
          (playerColor === 'black' && piece.color === 'b' && chess.turn() === 'b')
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
    <div className="inline-block bg-gradient-to-br from-amber-100 to-amber-200 p-3 sm:p-6 rounded-xl shadow-2xl">
      <div className="grid grid-cols-8 gap-0 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] border-4 border-amber-800 rounded-lg overflow-hidden">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const displayRow = playerColor === 'white' ? rowIndex : 7 - rowIndex;
            const displayCol = playerColor === 'white' ? colIndex : 7 - colIndex;
            
            return (
              <div
                key={`${displayRow}-${displayCol}`}
                className={`
                  aspect-square flex items-center justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black cursor-pointer
                  transition-all duration-200 hover:scale-105 active:scale-95 relative border border-amber-700/30
                  ${isLightSquare(displayRow, displayCol) 
                    ? 'bg-amber-50 hover:bg-amber-100 active:bg-amber-200' 
                    : 'bg-amber-800 hover:bg-amber-700 active:bg-amber-900'
                  }
                  ${isSquareHighlighted(displayRow, displayCol) 
                    ? 'ring-4 ring-yellow-400 bg-yellow-300 shadow-lg' 
                    : ''
                  }
                  ${isPossibleMove(displayRow, displayCol) 
                    ? 'after:absolute after:inset-1 sm:after:inset-2 after:bg-green-400 after:rounded-full after:opacity-70 after:shadow-lg' 
                    : ''
                  }
                  ${disabled ? 'cursor-default opacity-70' : 'cursor-pointer'}
                `}
                onClick={() => handleSquareClick(displayRow, displayCol)}
              >
                <span className="z-10 drop-shadow-lg select-none filter contrast-125 brightness-110">
                  {getPieceSymbol(piece)}
                </span>
              </div>
            );
          })
        )}
      </div>
      
      <div className="mt-3 text-center text-xs sm:text-sm text-amber-800 font-bold">
        Playing as {playerColor === 'white' ? 'White' : 'Black'}
        {disabled && ' (Spectating)'}
      </div>
    </div>
  );
};
