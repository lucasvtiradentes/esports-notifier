export function logger(message: string, newLine?: 'before' | 'after') {
  if (newLine === 'before') {
    console.log('');
  }

  console.log(message);

  if (newLine === 'after') {
    console.log('');
  }
}
