using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using MonikaAdmin.Core.Interfaces.Repository;

namespace MonikaAdmin.Repository;

public class Repository<TEntity> : IRepository<TEntity>
    where TEntity : class
{
    #region Private members

    private readonly DbSet<TEntity> _entities;

    #endregion

    #region Constructor

    public Repository(MonikaAdminDbContext dbContext)
    {
        _entities = dbContext.Set<TEntity>();
    }

    #endregion

    public IQueryable<TEntity> GetAll() => _entities;

    public IQueryable<TEntity> GetAllIncluding(params Expression<Func<TEntity, object>>[] includes)
    {
        IQueryable<TEntity> query = _entities;
        foreach (var include in includes)
        {
            query = query.Include(include);
        }
        return query;
    }

    public IQueryable<TEntity> Find(Expression<Func<TEntity, bool>> predicate) => _entities.Where(predicate);

    public void Add(TEntity entity) => _entities.Add(entity);

    public void AddRange(IEnumerable<TEntity> entities) => _entities.AddRange(entities);

    public void Remove(TEntity entity) => _entities.Remove(entity);

    public void Update(TEntity entity) => _entities.Update(entity);
}
