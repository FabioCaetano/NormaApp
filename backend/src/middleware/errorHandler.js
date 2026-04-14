const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err.name === 'Prisma.PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Registro duplicado', field: err.meta?.target });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  return res.status(500).json({ error: 'Erro interno do servidor' });
};

module.exports = { errorHandler };
