interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
    reviewsCount?: number;
    className?: string;
}

const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
};

const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
};

export const StarRating = ({
    rating,
    maxRating = 5,
    size = "md",
    showValue = true,
    reviewsCount,
    className = "",
}: StarRatingProps) => {
    const clampedRating = Math.max(0, Math.min(maxRating, Number(rating) || 0));

    return (
        <div
            className={`inline-flex items-center gap-1.5 ${className}`}
            role="img"
            aria-label={`Calificación: ${clampedRating.toFixed(1)} de ${maxRating} estrellas`}
        >
            <div className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: maxRating }, (_, index) => {
                    const fillPercentage = Math.max(
                        0,
                        Math.min(100, (clampedRating - index) * 100)
                    );

                    return (
                        <div key={index} className={`relative ${sizeClasses[size]}`}>
                            {/* Empty star background */}
                            <svg
                                viewBox="0 0 24 24"
                                className={`h-full w-full fill-slate-200 text-slate-200`}
                            >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>

                            {/* Filled star overlay */}
                            {fillPercentage > 0 && (
                                <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{ width: `${fillPercentage}%` }}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className={`h-full ${sizeClasses[size]} fill-amber-400 text-amber-400`}
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showValue && (
                <span className={`font-bold text-slate-700 ${textSizeClasses[size]}`}>
                    {clampedRating.toFixed(1)}
                </span>
            )}

            {reviewsCount !== undefined && (
                <span className={`text-slate-400 ${textSizeClasses[size]}`}>
                    ({reviewsCount} {reviewsCount === 1 ? "opinión" : "opiniones"})
                </span>
            )}
        </div>
    );
};
