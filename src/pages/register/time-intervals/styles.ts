import { Box, Heading, styled, Text } from '@ignite-ui/react';

export const Container = styled('main', {
  maxWidth: 572,

  margin: '$20 auto $4',

  padding: '0 $4',
});

export const IntervalHeader = styled('div', {
  padding: '0 $6',

  [`> ${Heading}`]: {
    lineHeight: '$base',
  },

  [`> ${Text}`]: {
    color: '$gray200',

    marginBottom: '$6',
  },
});

export const IntervalBox = styled(Box, {
  display: 'flex',
  flexDirection: 'column',

  marginTop: '$6',
});

export const IntervalsContainer = styled('div', {
  border: '1px solid $gray600',
  borderRadius: '$md',

  marginBottom: '$4',
});

export const IntervalItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '$3 $4',

  // APLICA O CSS SOMENTE NO INTERVALITEM QUE TIVER UM INTERVALITEM ANTES DELE
  '& + &': {
    borderTop: '1px solid $gray600',
  },
});

export const IntervalDay = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

export const IntervalInputs = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',

  'input::-webkit-calendar-picker-indicator': {
    filter: 'invert(100%) brightness(30%)',
  },
});

export const FormError = styled(Text, {
  color: '#f75a68',

  marginBottom: '$4',
});
