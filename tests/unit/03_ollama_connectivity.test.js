export async function runTest() {
  const controllerForAi = AbortSignal.timeout(2000);
  const res = await fetch('http://localhost:11434/api/tags', { signal: controllerForAi });
  if (!res.ok) {
    throw new Error('Servidor de IA Local (Ollama) não respondeu adequadamente.');
  }
  return 'Motor de IA Local (Ollama) Online e Responsivo.';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
