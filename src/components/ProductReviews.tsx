import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, StarHalf } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: number;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${productId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setRating(data.rating || { average: 0, count: 0 });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (userRating === 0) {
      toast({ variant: 'destructive', title: 'Selecione uma avaliação' });
      return;
    }

    const user = localStorage.getItem('numar.user');
    if (!user) {
      toast({ variant: 'destructive', title: 'Faça login para avaliar' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(user).token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          rating: userRating,
          title,
          comment,
          verified_purchase: false,
        }),
      });

      if (response.ok) {
        toast({ title: 'Avaliação enviada com sucesso!' });
        setShowForm(false);
        setUserRating(0);
        setTitle('');
        setComment('');
        fetchReviews();
      } else {
        toast({ variant: 'destructive', title: 'Erro ao enviar avaliação' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao enviar avaliação' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setUserRating(star)}
            className={`${interactive ? 'hover:scale-110 transition-transform' : ''}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl mb-2">Avaliações</h2>
          <div className="flex items-center gap-2">
            {renderStars(rating.average)}
            <span className="text-sm text-muted-foreground">
              {rating.average} ({rating.count} avaliações)
            </span>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Avaliar Produto'}
        </Button>
      </div>

      {showForm && (
        <div className="border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-medium">Escreva sua avaliação</h3>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Avaliação</label>
            {renderStars(userRating, true)}
          </div>
          <div>
            <Input
              placeholder="Título da sua avaliação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Conte sua experiência com o produto"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Seja o primeiro a avaliar este produto!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {renderStars(review.rating)}
                  {review.title && <p className="font-medium mt-1">{review.title}</p>}
                </div>
                {review.verified_purchase && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Compra verificada
                  </span>
                )}
              </div>
              {review.comment && <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                {review.helpful_count > 0 && <span>{review.helpful_count} pessoas acharam útil</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
