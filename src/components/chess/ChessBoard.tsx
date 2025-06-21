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
      // Keep the previous state if FEN is invalid
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
      try {
        const tempChess = new Chess(chess.fen());
        const move = tempChess.move({ from: selectedSquare as Square, to: square });
        if (move) {
          console.log('Making move:', selectedSquare, 'to', square);
          onMove?.(selectedSquare, square);
        } else {
          console.log('Invalid move attempted:', selectedSquare, 'to', square);
        }
      } catch (e) {
        console.log('Invalid move:', e);
      }
      
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      const piece = chess.get(square);
      if (piece) {
        // Allow any player to select any piece for now (spectator mode)
        // But only allow moves if it's the correct player's turn and piece
        const canSelectPiece = !disabled && (
          (playerColor === 'white' && piece.color === 'w') || 
          (playerColor === 'black' && piece.color === 'b') ||
          disabled // Allow selection in spectator mode
        );

        if (canSelectPiece || disabled) {
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
    <div className="inline-block bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-xl shadow-2xl">
      <div className="grid grid-cols-8 gap-0 w-80 h-80 md:w-96 md:h-96 border-4 border-amber-800 rounded-lg overflow-hidden">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const displayRow = playerColor === 'white' ? rowIndex : 7 - rowIndex;
            const displayCol = playerColor === 'white' ? colIndex : 7 - colIndex;
            
            return (
              <div
                key={`${displayRow}-${displayCol}`}
                className={`
                  aspect-square flex items-center justify-center text-2xl md:text-3xl font-bold cursor-pointer
                  transition-all duration-200 hover:scale-105 relative
                  ${isLightSquare(displayRow, displayCol) 
                    ? 'bg-amber-100 hover:bg-amber-200' 
                    : 'bg-amber-800 hover:bg-amber-700'
                  }
                  ${isSquareHighlighted(displayRow, displayCol) 
                    ? 'ring-4 ring-yellow-400 bg-yellow-300' 
                    : ''
                  }
                  ${isPossibleMove(displayRow, displayCol) 
                    ? 'after:absolute after:inset-2 after:bg-green-400 after:rounded-full after:opacity-60' 
                    : ''
                  }
                  ${disabled ? 'cursor-default' : 'cursor-pointer'}
                `}
                onClick={() => handleSquareClick(displayRow, displayCol)}
              >
                <span className="z-10 drop-shadow-sm select-none">
                  {getPieceSymbol(piece)}
                </span>
              </div>
            );
          })
        )}
      </div>
      
      {/* Board coordinates for better UX */}
      <div className="mt-2 text-center text-xs text-amber-800 font-medium">
        Playing as {playerColor === 'white' ? 'White' : 'Black'}
        {disabled && ' (Spectating)'}
      </div>
    </div>
  );
};
