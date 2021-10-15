import styled from "styled-components";

export const StyledLargeHeading = styled.h2`
    font-size: 2rem;
    font-weight: 800;
`;

export const StyledMediumHeading = styled.h3<{
    plusSize?: boolean,
}>`
  font-size: ${props => props.plusSize ? '1.6rem' : '1.4rem'};
  font-weight: 800;
`

export const StyledHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
`

export const StyledSmallText = styled.div`
  font-size: 0.8rem;
`
