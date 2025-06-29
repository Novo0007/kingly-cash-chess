
import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useSound } from '@/hooks/use-sound';

interface ChessBoardProps {
  fen?: string;
  onMove: (from: string, to: string, promotion?: string) => void;
  playerColor: 'white' | 'black';
  disabled?: boolean;
  isPlayerTurn?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  onMove,
  playerColor,
  disabled = false,
  isPlayerTurn = false,
}) => {
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isInCheck, setIsInCheck] = useState(false);
  const [boardKey, setBoardKey] = useState(0);
  const { playSound } = useSound();

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBoardKey(prev => prev + 1);
      console.log('ChessBoard: Auto-refreshing board state');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateBoardState = useCallback(() => {
    try {
      console.log('ChessBoard: Updating with FEN:', fen);
      chess.load(fen);
      setIsInCheck(chess.inCheck());
      
      // Extract last move from move history
      const history = chess.history({ verbose: true });
      if (history.length > 0) {
        const lastMoveData = history[history.length - 1];
        setLastMove({ from: lastMoveData.from, to: lastMoveData.to });
      } else {
        setLastMove(null);
      }
      
      console.log('ChessBoard: Successfully updated board state');
    } catch (error) {
      console.error('ChessBoard: Error updating board state:', error);
    }
  }, [fen, chess]);

  useEffect(() => {
    updateBoardState();
  }, [updateBoardState, boardKey]);

  const handleSquareClick = useCallback((square: string) => {
    if (disabled || !isPlayerTurn) {
      console.log('ChessBoard: Move disabled or not player turn');
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    if (selectedSquare && possibleMoves.includes(square)) {
      // Make the move
      try {
        const moveObj = chess.move({
          from: selectedSquare,
          to: square,
          promotion: 'q' // Default to queen for now
        });

        if (moveObj) {
          playSound('move');
          onMove(selectedSquare, square);
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      } catch (error) {
        console.error('ChessBoard: Invalid move:', error);
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
      return;
    }

    // Select a piece
    const piece = chess.get(square);
    if (piece && (
      (piece.color === 'w' && playerColor === 'white') ||
      (piece.color === 'b' && playerColor === 'black')
    )) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setPossibleMoves(moves.map(move => move.to));
      playSound('select');
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [selectedSquare, possibleMoves, disabled, isPlayerTurn, chess, playerColor, onMove, playSound]);

  const renderSquare = useCallback((square: string, piece: any, squareIndex: number) => {
    const file = square[0];
    const rank = parseInt(square[1]);
    const isLight = (file.charCodeAt(0) - 97 + rank) % 2 === 1;
    const isSelected = selectedSquare === square;
    const isPossibleMove = possibleMoves.includes(square);
    const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
    const isKingInCheck = piece && piece.type === 'k' && piece.color === chess.turn() && isInCheck;

    // Flip board for black player
    const shouldFlip = playerColor === 'black';
    const displayFile = shouldFlip ? String.fromCharCode(104 - file.charCodeAt(0) + 97) : file;
    const displayRank = shouldFlip ? 9 - rank : rank;

    return (
      <div
        key={`${square}-${boardKey}`}
        className={`
          relative w-full h-full flex items-center justify-center cursor-pointer
          transition-all duration-200 hover:brightness-110 active:scale-95
          ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
          ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
          ${isPossibleMove ? 'ring-2 ring-green-500 ring-inset' : ''}
          ${isLastMoveSquare ? 'bg-yellow-300' : ''}
          ${isKingInCheck ? 'bg-red-400 animate-pulse' : ''}
        `}
        onClick={() => handleSquareClick(square)}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        {/* Coordinates */}
        {file === 'a' && (
          <span className="absolute left-1 top-1 text-xs font-bold text-gray-600">
            {displayRank}
          </span>
        )}
        {rank === 1 && (
          <span className="absolute right-1 bottom-1 text-xs font-bold text-gray-600">
            {displayFile}
          </span>
        )}

        {/* Piece */}
        {piece && (
          <div className="text-3xl sm:text-4xl md:text-5xl select-none pointer-events-none">
            {getPieceSymbol(piece)}
          </div>
        )}

        {/* Move indicator */}
        {isPossibleMove && !piece && (
          <div className="w-4 h-4 bg-green-500 rounded-full opacity-60"></div>
        )}
        {isPossibleMove && piece && (
          <div className="absolute inset-0 border-4 border-green-500 rounded-full opacity-60"></div>
        )}
      </div>
    );
  }, [selectedSquare, possibleMoves, lastMove, isInCheck, chess, playerColor, handleSquareClick, boardKey]);

  const getPieceSymbol = (piece: any) => {
    const symbols = {
      'p': piece.color === 'w' ? '♙' : '♟',
      'r': piece.color === 'w' ? '♖' : '♜',
      'n': piece.color === 'w' ? '♘' : '♞',
      'b': piece.color === 'w' ? '♗' : '♝',
      'q': piece.color === 'w' ? '♕' : '♛',
      'k': piece.color === 'w' ? '♔' : '♚',
    };
    return symbols[piece.type as keyof typeof symbols];
  };

  const renderBoard = () => {
    const squares = [];
    const shouldFlip = playerColor === 'black';
    
    for (let rank = 8; rank >= 1; rank--) {
      for (let file = 0; file < 8; file++) {
        const fileChar = String.fromCharCode(97 + file); // a-h
        const square = `${fileChar}${rank}`;
        const piece = chess.get(square);
        
        const displayRank = shouldFlip ? 9 - rank : rank;
        const displayFile = shouldFlip ? 7 - file : file;
        const squareIndex = displayRank * 8 + displayFile;
        
        squares.push(renderSquare(square, piece, squareIndex));
      }
    }

    return squares;
  };

  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-4">
      {/* Game status */}
      <div className="text-center">
        <div className="text-sm sm:text-base font-medium text-gray-700 mb-1">
          {playerColor === 'white' ? 'Playing as White' : 'Playing as Black'}
        </div>
        {isPlayerTurn && (
          <div className="text-xs sm:text-sm text-green-600 font-bold animate-pulse">
            Your Turn
          </div>
        )}
        {isInCheck && (
          <div className="text-xs sm:text-sm text-red-600 font-bold animate-pulse">
            Check!
          </div>
        )}
      </div>

      {/* Chess Board */}
      <div 
        className="grid grid-cols-8 gap-0 border-4 border-amber-900 shadow-2xl bg-amber-900 rounded-lg overflow-hidden"
        style={{ 
          width: 'min(90vw, 90vh, 480px)', 
          height: 'min(90vw, 90vh, 480px)',
          touchAction: 'manipulation'
        }}
      >
        {renderBoard()}
      </div>

      {/* Move indicator */}
      {selectedSquare && (
        <div className="text-xs sm:text-sm text-gray-600 text-center">
          Selected: {selectedSquare.toUpperCase()}
          {possibleMoves.length > 0 && (
            <div className="text-green-600 mt-1">
              {possibleMoves.length} possible move{possibleMoves.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
