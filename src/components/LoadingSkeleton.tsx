import React from "react";
import { Skeleton, TableRow, TableCell } from "@mui/material";

interface TransactionTableSkeletonProps {
  rows?: number;
}

const TransactionTableSkeleton: React.FC<TransactionTableSkeletonProps> = ({
  rows = 5,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton variant="text" width="80%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="60%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="70%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="70%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="rectangular" width={60} height={24} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="80%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="90%" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="40%" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default TransactionTableSkeleton;
